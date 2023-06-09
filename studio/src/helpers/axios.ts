import axios from 'axios';
import useAuthStore from '@/store/auth/authStore.ts';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost/api';

export const instance = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
	validateStatus: (status) => status < 500,
});

instance.interceptors.request.use((config) => {
	config.headers['Content-Type'] = 'application/json';
	const accessToken = useAuthStore.getState().user?.at;
	if (accessToken) {
		config.headers['Authorization'] = accessToken;
	}
	return config;
});
