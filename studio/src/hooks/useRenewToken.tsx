import { useEffect } from 'react';
import useAuthStore from '@/store/auth/authStore.ts';

let interval: number | null = null;
export default function useRenewToken(mins = 2) {
	const { user, renewAccessToken } = useAuthStore();

	useEffect(() => {
		interval = window.setInterval(() => renewAccessToken(), mins * 60 * 1000);
		return () => {
			if (interval) window.clearInterval(interval);
		};
	}, [user]);
}
