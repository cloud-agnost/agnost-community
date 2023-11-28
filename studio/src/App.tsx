import { useRealtime, useRenewToken, useEnvironmentStatus } from '@/hooks';
import '@/i18n/config';
import { router } from '@/router';
import useAuthStore from '@/store/auth/authStore.ts';
import useTypeStore from '@/store/types/typeStore.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useThemeStore from './store/theme/themeStore';

const queryClient = new QueryClient();
function App() {
	useRenewToken(2);
	useRealtime();
	useEnvironmentStatus();

	const { getAllTypes } = useTypeStore();
	const { accessToken } = useAuthStore();
	const { theme } = useThemeStore();

	useEffect(() => {
		if (!_.isEmpty(accessToken)) {
			getAllTypes();
		}
	}, [accessToken]);

	useEffect(() => {
		let systemTheme = theme;
		if (theme === 'system') {
			systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		document.body.classList.remove('dark', 'light');
		document.body.dataset.mode = systemTheme;
		document.body.classList.add(systemTheme);
	}, [theme]);

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ToastContainer
				transition={Slide}
				position='top-center'
				autoClose={2000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='dark'
			/>
		</QueryClientProvider>
	);
}

export default App;
