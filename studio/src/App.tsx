import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useTranslation } from 'react-i18next';

function App() {
	const { t } = useTranslation();
	return (
		<div className='bg-base'>
			<RouterProvider router={router}></RouterProvider>
			<h1 className='text-default text-3xl'>{t('title')}</h1>
			<h4 className='text-elements-strong-red'>{t('description')}</h4>
			<h4 className='text-surface-orange'>{t('description')}</h4>
		</div>
	);
}

export default App;
