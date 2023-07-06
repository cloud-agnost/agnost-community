import { ReactNode } from 'react';
import './settingsContainer.scss';

interface Props {
	children: ReactNode;
	pageTitle: string;
}
export default function SettingsContainer({ children, pageTitle }: Props) {
	return (
		<div className='setting-container'>
			<div className='setting-container-title'>
				<h3>{pageTitle}</h3>
			</div>
			<div className='setting-container-content'>
				<div className='setting-container-content-scroll-area p-[21px]'>{children}</div>
			</div>
		</div>
	);
}
