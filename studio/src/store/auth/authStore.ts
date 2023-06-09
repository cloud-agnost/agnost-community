import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { APIError, User } from '@/types/type.ts';

interface AuthStore {
	loading: boolean;
	error: APIError | null;
	user: User | null;
	setUser: (user: User) => void;
	login: () => void;
	logout: () => void;
	setToken: (token: string) => void;
	setRefreshToken: (refreshToken: string) => void;
	isAuthenticated: boolean;
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
				login: () => {
					// TODO Implement
				},
				logout: () => {
					// TODO Implement
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
				isAuthenticated: get()?.user !== null,
				finalizeClusterSetup: () => {
					// TODO
				},
				initializeAccountSetup: () => {
					// TODO
				},
				finalizeAccountSetup: () => {
					// TODO
				},
				completeAccountSetupFollowingInviteAccept: () => {
					// TODO
				},
				renewAccessToken: () => {
					// TODO
				},
			}),
			{
				name: 'auth-storage',
			},
		),
	),
);

export default useAuthStore;
