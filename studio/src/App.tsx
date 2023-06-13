import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useRenewToken } from '@/hooks';

function App() {
	useRenewToken(2);
	return <RouterProvider router={router} />;
}

export default App;
