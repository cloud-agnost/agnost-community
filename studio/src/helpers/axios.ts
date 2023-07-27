import { ERROR_CODES_TO_REDIRECT_LOGIN_PAGE } from '@/constants';
import useAuthStore from '@/store/auth/authStore.ts';
import useEnvironmentStore from '@/store/environment/environmentStore';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost/api';

export const instance = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const testEndpointInstance = axios.create({
	baseURL: `http://localhost/${useEnvironmentStore.getState().environment?.iid}/api`,
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
		const apiError = error.response?.data ?? error;
		if (ERROR_CODES_TO_REDIRECT_LOGIN_PAGE.includes(apiError.code)) {
			// TODO: redirect to login page and clear store
		}
		Promise.reject(apiError);
	},
);

testEndpointInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		return error;
	},
);
