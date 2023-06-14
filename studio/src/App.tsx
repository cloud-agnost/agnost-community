import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useRenewToken } from '@/hooks';
import '@/i18n/config';

function App() {
	useRenewToken(2);
	return <RouterProvider router={router} />;
}

export default App;
