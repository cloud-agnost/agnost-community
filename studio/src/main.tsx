import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './locales/i18n';

import './index.scss';
import 'swiper/css';
import 'swiper/css/pagination';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
