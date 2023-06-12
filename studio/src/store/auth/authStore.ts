import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { APIError, User } from '@/types/type.ts';
import { AuthService, UserService } from '@/services';

interface AuthStore {
	loading: boolean;
	error: APIError | null;
	user: User | null;
	setUser: (user: User | null) => void;
	login: (email: string, password: string) => Promise<User>;
	logout: () => any;
	setToken: (token: string) => void;
	setRefreshToken: (refreshToken: string) => void;
	isAuthenticated: () => boolean;
	renewAccessToken: () => void;
	completeAccountSetupFollowingInviteAccept: () => void;
	resetPassword: (email: string) => Promise<void>;
	verifyEmail: (email: string, code: number) => Promise<void>;
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
				async resetPassword(email) {
					return UserService.resetPassword({
						email,
						uiBaseURL: window.location.origin,
					});
				},
				async verifyEmail(email: string, code: number) {
					await AuthService.validateEmail(email, code);
				},
			}),
			{
				name: 'auth-storage',
			},
		),
	),
);

export default useAuthStore;