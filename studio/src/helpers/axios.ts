import axios from 'axios';
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
	const token = localStorage.getItem('token');
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});
