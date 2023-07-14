import '@/i18n/config';
import { useRenewToken, useRealtime } from '@/hooks';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { router } from '@/router';
import { useEffect } from 'react';
import useTypeStore from '@/store/types/typeStore.ts';

function App() {
	useRenewToken(2);
	useRealtime();

	const { getAllTypes, isTypesOk } = useTypeStore();

	useEffect(() => {
		if (!isTypesOk) {
			getAllTypes();
		}
	}, [isTypesOk]);

	return (
		<>
			<RouterProvider router={router} />
			<ToastContainer
				position='top-right'
				autoClose={5000}
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
