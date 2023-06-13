import { AuthService, UserService } from '@/services';
import type {
	APIError,
	CompleteAccountSetupRequest,
	FinalizeAccountSetupRequest,
	User,
} from '@/types/type.ts';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthStore {
	loading: boolean;
	error: APIError | null;
	user: User | null;
	email: string | null;
	setUser: (user: User | null) => void;
	login: (email: string, password: string) => Promise<User>;
	logout: () => Promise<any>;
	setToken: (token: string) => void;
	setRefreshToken: (refreshToken: string) => void;
	isAuthenticated: () => boolean;
	renewAccessToken: () => void;
	completeAccountSetup: (data: CompleteAccountSetupRequest) => Promise<User | APIError>;
	resetPassword: (email: string) => Promise<void>;
	verifyEmail: (email: string, code: number) => Promise<void>;
	changePasswordWithToken: (token: string, newPassword: string) => Promise<void>;
	resendEmailVerificationCode: (email: string) => Promise<void>;
	initiateAccountSetup: (
		email: string,
		onSuccess: () => void,
		onError: (err: APIError) => void,
	) => Promise<void>;
	finalizeAccountSetup: (data: FinalizeAccountSetupRequest) => Promise<User | APIError>;
	acceptInvite: (token: string) => Promise<{
		user: User;
	}>;
}

const useAuthStore = create<AuthStore>()(
	devtools(
		persist(
			(set, get) => ({
				loading: false,
				error: null,
				user: null,
				email: null,
				setUser: (user) => set({ user }),
				login: async (email, password) => {
					const res = await AuthService.login(email, password);
					set({ user: res });
					return res;
				},
				logout: async () => {
					const res = await AuthService.logout();
					set({ user: null });
					return res;
				},
				setToken: (token) =>
					set((prev) => {
						if (prev.user) prev.user.at = token;
						return prev;
					}),
				setRefreshToken: (refreshToken) =>
					set((prev) => {
						if (prev.user) prev.user.rt = refreshToken;
						return prev;
					}),
				isAuthenticated: () => get()?.user !== null,
				renewAccessToken: async () => {
					if (!get().isAuthenticated()) return;
					const res = await AuthService.renewAccessToken();
					get().setRefreshToken(res.rt);
					get().setToken(res.at);
				},
				completeAccountSetup: async (data) => {
					try {
						const user = await AuthService.completeAccountSetup(data);
						set({ user });
						return user;
					} catch (error) {
						throw error as APIError;
					}
				},
				resetPassword(email) {
					return UserService.resetPassword({
						email,
						uiBaseURL: window.location.origin,
					});
				},
				async verifyEmail(email: string, code: number) {
					try {
						const user = await AuthService.validateEmail(email, code);
						set({ user });
						return user;
					} catch (error) {
						throw error as APIError;
					}
				},
				changePasswordWithToken(token: string, newPassword: string) {
					return UserService.changePasswordWithToken({
						token,
						newPassword,
					});
				},
				async resendEmailVerificationCode(email: string) {
					await AuthService.resendEmailVerificationCode(email);
				},
				async initiateAccountSetup(
					email: string,
					onSuccess: () => void,
					onError: (err: APIError) => void,
				) {
					try {
						await AuthService.initiateAccountSetup(email);
						set({ email });
						onSuccess();
					} catch (error) {
						onError(error as APIError);
					}
				},
				async finalizeAccountSetup(data: FinalizeAccountSetupRequest) {
					try {
						const res = await AuthService.finalizeAccountSetup(data);
						set({ user: res });
						return res;
					} catch (error) {
						throw error as APIError;
					}
				},
				async acceptInvite(token: string) {
					try {
						return UserService.acceptInvite(token);
					} catch (err) {
						set({ error: err as APIError });
					}
				},
			}),
			{
				name: 'auth-storage',
			},
		),
	),
);

export default useAuthStore;
