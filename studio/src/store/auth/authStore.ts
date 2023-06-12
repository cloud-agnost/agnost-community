import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { APIError, User } from '@/types/type.ts';
import { AuthService, UserService } from '@/services';
import { FinalizeAccountSetupData } from '@/types/type.ts';

interface AuthStore {
	loading: boolean;
	error: APIError | null;
	user: User | null;
	setUser: (user: User | null) => void;
	login: (email: string, password: string) => Promise<User>;
	logout: () => Promise<any>;
	setToken: (token: string) => void;
	setRefreshToken: (refreshToken: string) => void;
	isAuthenticated: () => boolean;
	renewAccessToken: () => void;
	completeAccountSetupFollowingInviteAccept: () => void;
	resetPassword: (email: string) => Promise<void>;
	verifyEmail: (email: string, code: number) => Promise<void>;
	changePasswordWithToken: (token: string, newPassword: string) => Promise<void>;
	completeAccountSetup: (email: string) => Promise<void>;
	finalizeAccountSetup: (data: FinalizeAccountSetupData) => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
	devtools(
		persist(
			(set, get) => ({
				loading: false,
				error: null,
				user: null,
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
				renewAccessToken: () => {
					// TODO renew access token
				},
				completeAccountSetupFollowingInviteAccept() {
					// TODO complete account setup following invite accept
				},
				resetPassword(email) {
					return UserService.resetPassword({
						email,
						uiBaseURL: window.location.origin,
					});
				},
				verifyEmail(email: string, code: number) {
					return AuthService.validateEmail(email, code);
				},
				changePasswordWithToken(token: string, newPassword: string) {
					return UserService.changePasswordWithToken({
						token,
						newPassword,
					});
				},
				completeAccountSetup(email: string) {
					return AuthService.initiateAccountSetup(email);
				},
				finalizeAccountSetup(data) {
					return AuthService.finalizeAccountSetup(data);
				},
			}),
			{
				name: 'auth-storage',
			},
		),
	),
);

export default useAuthStore;
