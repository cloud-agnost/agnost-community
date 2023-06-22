import { AuthService, UserService } from '@/services';
import type {
	APIError,
	CompleteAccountSetupRequest,
	FinalizeAccountSetupRequest,
	User,
} from '@/types/type.ts';
import { joinChannel, leaveChannel } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthStore {
	accessToken: string | null | undefined;
	refreshToken: string | null | undefined;
	loading: boolean;
	error: APIError | null;
	user: User | null;
	email: string | null;
	setUser: (user: User | null) => void;
	login: (email: string, password: string) => Promise<User>;
	logout: () => Promise<void>;
	setToken: (accessToken: string | null | undefined) => void;
	setRefreshToken: (refreshToken: string | null | undefined) => void;
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
	changeName: (name: string) => Promise<User>;
	changeEmail: (email: string, password: string) => Promise<string>;
	changeAvatar: (avatar: File) => Promise<User>;
	removeAvatar: () => Promise<void>;
	changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
	deleteAccount: () => Promise<void>;
	updateNotifications: (notifications: string[]) => Promise<User>;
	confirmChangeLoginEmail: (token: string) => Promise<void>;
	getUser: () => Promise<User>;
	getUserPicture: () => string;
}

const useAuthStore = create<AuthStore>()(
	devtools(
		persist(
			(set, get) => ({
				accessToken: null,
				refreshToken: null,
				loading: false,
				error: null,
				user: null,
				email: null,
				setUser: (user) => {
					set({ user });
					if (user) joinChannel(user._id);
					if (user?.at) get().setToken(user.at);
					if (user?.rt) get().setRefreshToken(user.rt);
				},
				login: async (email, password) => {
					const res = await AuthService.login(email, password);
					get().setUser(res);
					return res;
				},
				logout: async () => {
					const user = get().user;
					if (user) leaveChannel(user?._id);
					const res = await AuthService.logout();
					get().setUser(null);
					localStorage.clear();
					return res;
				},
				setToken: (accessToken) => set({ accessToken }),
				setRefreshToken: (refreshToken) => set({ refreshToken }),
				isAuthenticated: () => Boolean(get().accessToken),
				renewAccessToken: async () => {
					if (!get().isAuthenticated()) return;
					const res = await AuthService.renewAccessToken();
					get().setRefreshToken(res.rt);
					get().setToken(res.at);
				},
				completeAccountSetup: async (data) => {
					try {
						const user = await AuthService.completeAccountSetup(data);
						get().setUser(user);
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
						get().setUser(user);
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
						get().setUser(res);
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
				async changeName(name: string) {
					const user = await UserService.changeName(name);
					set({ user });
					return user;
				},
				async changeEmail(email: string, password) {
					const newEmail = await UserService.changeEmail({
						email,
						password,
						uiBaseURL: window.location.origin,
					});
					console.log(newEmail);
					return newEmail;
				},
				async changeAvatar(avatar: File) {
					const user = await UserService.changeAvatar(avatar);
					set({ user });
					return user;
				},
				async removeAvatar() {
					try {
						await UserService.removeAvatar();
						set((prev) => {
							delete prev.user?.pictureUrl;
							return prev;
						});
					} catch (err) {
						set({ error: err as APIError });
						throw err;
					}
				},
				async changePassword(currentPassword: string, newPassword: string) {
					return UserService.changePassword(currentPassword, newPassword);
				},
				async deleteAccount() {
					return UserService.deleteAccount();
				},
				async updateNotifications(notifications: string[]) {
					const res = await UserService.updateNotifications({ notifications });
					set({ user: res });
					return res;
				},
				confirmChangeLoginEmail(token: string) {
					return UserService.confirmChangeLoginEmail(token);
				},
				async getUser() {
					const user = await UserService.getUser();
					set({ user });
					return user;
				},
				getUserPicture() {
					return location.origin + '/api' + get().user?.pictureUrl;
				},
			}),
			{
				name: 'auth-storage',
			},
		),
		{
			name: 'auth',
		},
	),
);

export default useAuthStore;
