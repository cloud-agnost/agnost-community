import { useRealtime, useRenewToken } from '@/hooks';
import '@/i18n/config';
import { router } from '@/router';
import useAuthStore from '@/store/auth/authStore.ts';
import useTypeStore from '@/store/types/typeStore.ts';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
	useRenewToken(2);
	useRealtime();

	const { getAllTypes, isTypesOk } = useTypeStore();
	const { user } = useAuthStore();

	useEffect(() => {
		if (!isTypesOk && user) {
			getAllTypes();
		}
	}, [isTypesOk, user]);

	const toastSlide = cssTransition({
		enter: 'slideInDown',
		exit: 'slideOutUp',
	});

	return (
		<>
			<RouterProvider router={router} />
			<ToastContainer
				position='top-center'
				autoClose={3000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				transition={toastSlide}
				theme='dark'
			/>
		</>
	);
}

export default App;
