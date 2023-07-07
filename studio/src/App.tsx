import '@/i18n/config';
import { useRenewToken } from '@/hooks';
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { router } from '@/router';
import useRealtime from './hooks/useRealtime';

function App() {
	useRenewToken(2);
	useRealtime();
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
