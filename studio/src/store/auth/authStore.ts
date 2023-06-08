import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthService } from '@/services';
import type { APIError, User } from '@/types/type.ts';

interface AuthStore {
	loading: boolean;
	error: APIError | null;
	user: User | null;
	setUser: (user: User) => void;
	login: () => void;
	logout: () => void;
	token: string;
	setToken: (token: string) => void;
	refreshToken: string;
	setRefreshToken: (refreshToken: string) => void;
	isAuthenticated: boolean;
	initializeClusterSetup: () => void;
	finalizeClusterSetup: () => void;
	initializeAccountSetup: () => void;
	finalizeAccountSetup: () => void;
	completeAccountSetupFollowingInviteAccept: () => void;
	renewAccessToken: () => void;
}

const useAuthStore = create<AuthStore>()(
	devtools(
		persist(
			(set) => ({
				loading: false,
				error: null,
				user: null,
				setUser: (user) => set({ user }),
				login: () => set({ isAuthenticated: true }),
				logout: () => set({ isAuthenticated: false }),
				token: '',
				setToken: (token) => set({ token }),
				refreshToken: '',
				setRefreshToken: (refreshToken) => set({ refreshToken }),
				isAuthenticated: false,
				initializeClusterSetup: async () => {
					set({ loading: true, error: null });
					try {
						const user = await AuthService.initializeClusterSetup();
						set({ loading: false, user });
					} catch (error) {
						set({ error: error as APIError });
					}
				},
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
