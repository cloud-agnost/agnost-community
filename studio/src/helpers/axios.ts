import useAuthStore from '@/store/auth/authStore.ts';
import { APIError } from '@/types';
import axios from 'axios';
const baseURL = `${window.location.protocol}//${window.location.hostname}`;

const headers = {
	'Content-Type': 'application/json',
};
export const instance = axios.create({
	baseURL: `${baseURL}/api`,
	headers,
});

export const envInstance = axios.create({
	headers,
	baseURL,
});

export const testEndpointInstance = axios.create({
	headers,
	baseURL,
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
		const err = error.response.data as APIError;
		const apiError = {
			...err,
			details: err.fields?.[0]?.msg ?? err.details,
		};
		// if (ERROR_CODES_TO_REDIRECT_LOGIN_PAGE.includes(apiError.code)) {
		// 	useAuthStore.getState().logout({
		// 		onSuccess: () => {
		// 			resetAllStores();
		// 		},
		// 	});
		// }
		// if (error.response.status === 401) {
		// 	window.location.href = '/401';
		// }
		// if (error.response.status === 404) {
		// 	window.location.href = '/404';
		// }

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

envInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	({ response: { data } }) => {
		const err: APIError = {
			code: data.code ?? data.errors[0].code,
			error: data.error ?? data.errors[0].error ?? data.errors[0].specifics[0].code,
			details: data.message ?? data.errors[0].message ?? data.errors.fields?.[0]?.msg,
		};
		return Promise.reject(err);
	},
);
