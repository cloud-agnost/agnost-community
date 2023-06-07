import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
	const { t } = useTranslation();
		return <RouterProvider router={router}></RouterProvider>;


export default App;
