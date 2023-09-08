import { useRealtime, useRenewToken } from '@/hooks';
import '@/i18n/config';
import { router } from '@/router';
import useAuthStore from '@/store/auth/authStore.ts';
import useTypeStore from '@/store/types/typeStore.ts';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useThemeStore from './store/theme/themeStore';

function App() {
	useRenewToken(2);
	useRealtime();

	const { getAllTypes, isTypesOk } = useTypeStore();
	const { user } = useAuthStore();
	const { theme } = useThemeStore();

	useEffect(() => {
		if (!isTypesOk && user) {
			getAllTypes();
		}
	}, [isTypesOk, user]);

	useEffect(() => {
		let systemTheme = theme;
		if (theme === 'system') {
			systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		document.body.classList.remove('dark', 'light');
		document.body.classList.add(systemTheme);
	}, [theme]);

	return (
		<>
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
		</>
	);
}

export default App;
