import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useTranslation } from 'react-i18next';
import { Button } from './components/Button';

function App() {
	const { t } = useTranslation();
	return (
		<div className='bg-base h-screen w-screen flex items-center justify-center flex-col space-y-3'>
			{/* <RouterProvider router={router}></RouterProvider>
			<h1 className='text-default text-3xl'>{t('title')}</h1>
			<h4 className='text-elements-strong-red'>{t('description')}</h4>
			<h4 className='text-surface-orange'>{t('description')}</h4> */}
			<Button variant='primary'>Placeholder</Button>
			<Button variant='secondary' size='sm'>
				Placeholder
			</Button>
			<Button variant='text'>Placeholder</Button>
			<Button variant='link'>Placeholder</Button>
		</div>
	);
}

export default App;
