import App from '@/App.tsx';
import '@/i18n/config';
import '@/index.scss';
import ReactDOM from 'react-dom/client';
import { AliveScope } from 'react-activation';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<AliveScope>
		<App />
	</AliveScope>,
);
