import { useFetchReleaseHistory, useRealtime } from '@/hooks';
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
	useFetchReleaseHistory();
	useRealtime();

	const { getAllTypes } = useTypeStore();
	const { accessToken, user } = useAuthStore();
	const { getTheme } = useThemeStore();

	useEffect(() => {
		if (!_.isEmpty(accessToken)) {
			getAllTypes();
		}
	}, []);

	useEffect(() => {
		const theme = getTheme(user?._id ?? '');
		let systemTheme = theme;
		if (theme === 'system') {
			systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		document.body.classList.remove('dark', 'light');
		document.body.dataset.mode = systemTheme;
		document.body.classList.add(systemTheme);
	}, [getTheme(user?._id ?? '')]);

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
