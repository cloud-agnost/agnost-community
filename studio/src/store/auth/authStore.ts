import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { APIError, User } from '@/types/type.ts';
import { AuthService } from '@/services';

interface AuthStore {
	loading: boolean;
	error: APIError | null;
	user: User | null;
	isAuthenticated: boolean;
	setUser: (user: User) => void;
	login: () => void;
	logout: () => void;
	setToken: (token: string) => void;
	setRefreshToken: (refreshToken: string) => void;
	finalizeClusterSetup: () => void;
	initializeAccountSetup: () => void;
	finalizeAccountSetup: () => void;
	completeAccountSetupFollowingInviteAccept: () => void;
	renewAccessToken: () => void;
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
			}),
			{
				name: 'auth-storage',
			},
		),
	),
);

export default useAuthStore;
