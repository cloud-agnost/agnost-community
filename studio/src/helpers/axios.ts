import axios from 'axios';
import useAuthStore from '@/store/auth/authStore.ts';
import { APIError } from '@/types';
import { ERROR_CODES_TO_REDIRECT_LOGIN_PAGE } from '@/constants';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost/api';

export const instance = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

instance.interceptors.request.use((config) => {
	const accessToken = useAuthStore.getState().accessToken;
	if (accessToken) {
		config.headers['Authorization'] = accessToken;
	}
	return config;
});

instance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const apiError = error.response.data as APIError;
		if (ERROR_CODES_TO_REDIRECT_LOGIN_PAGE.includes(apiError.code)) {
			// TODO: redirect to login page and clear store
		}
		return Promise.reject(apiError);
	},
);
