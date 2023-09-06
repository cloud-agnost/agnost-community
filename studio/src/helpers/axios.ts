import { ERROR_CODES_TO_REDIRECT_LOGIN_PAGE } from '@/constants';
import useAuthStore from '@/store/auth/authStore.ts';
import { APIError } from '@/types';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost/api';

const headers = {
	'Content-Type': 'application/json',
};
console.log('baseURL', baseURL);
export const instance = axios.create({
	baseURL,
	headers,
});

export const envInstance = axios.create({
	headers,
});

export const testEndpointInstance = axios.create({
	headers,
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
			localStorage.clear();
			useAuthStore.getState().logout();
		}
		if (error.response.status === 401) {
			window.location.href = '/401';
		}
		if (error.response.status === 404) {
			window.location.href = '/404';
		}

		return Promise.reject(apiError);
	},
);

envInstance.interceptors.request.use((config) => {
	const accessToken = useAuthStore.getState().accessToken;
	if (accessToken) {
		config.headers['Authorization'] = accessToken;
	}
	return config;
});

testEndpointInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		return error;
	},
);
envInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		const err: APIError = {
			code: error.response.data.code,
			error: error.response.data.error,
			details: error.response.data.message,
		};
		return Promise.reject(err);
	},
);
