import axios from 'axios';
import useAuthStore from '@/store/auth/authStore.ts';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost/api';

export const instance = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

instance.interceptors.request.use((config) => {
	config.headers['Content-Type'] = 'application/json';
	const accessToken = useAuthStore.getState().user?.at;
	if (accessToken) {
		config.headers['Authorization'] = accessToken ?? 'at-51249e5321534d838cbc79d6cf60d598';
	}
	return config;
});

instance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => Promise.reject(error.response.data),
);
