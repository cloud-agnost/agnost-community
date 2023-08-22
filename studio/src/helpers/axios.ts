import { ERROR_CODES_TO_REDIRECT_LOGIN_PAGE } from '@/constants';
import useAuthStore from '@/store/auth/authStore.ts';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { APIError } from '@/types';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost/api';
const envBaseURL = `http://localhost/${useEnvironmentStore.getState().environment?.iid}`;

const headers = {
	'Content-Type': 'application/json',
};
export const instance = axios.create({
	baseURL,
	headers,
});

export const envInstance = axios.create({
	baseURL: envBaseURL,
	headers,
});

export const testEndpointInstance = axios.create({
	baseURL: `${envBaseURL}/api`,
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
			// TODO: redirect to login page and clear store
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
		return Promise.reject(error);
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
		console.log(err);
		// if (err.code === '413')
		return Promise.reject(err);
	},
);
