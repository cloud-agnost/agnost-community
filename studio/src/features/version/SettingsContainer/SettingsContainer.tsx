import { ReactNode } from 'react';
import './settingsContainer.scss';

interface Props {
	children: ReactNode;
	pageTitle: string;
	info?: ReactNode | string;
	action?: ReactNode;
}
export default function SettingsContainer({ children, pageTitle, info, action }: Props) {
	return (
		<div className='setting-container'>
			<div className='setting-container-header'>
				<div className='setting-container-header-info'>
					<h3 className='setting-container-header-info-title'>{pageTitle}</h3>
					{info && <div className='setting-container-header-info-desc'>{info}</div>}
				</div>
				{action && <div className='setting-container-header-action'>{action}</div>}
			</div>
			<div className='setting-container-content'>
				<div className='setting-container-content-scroll-area p-[21px]'>{children}</div>
			</div>
		</div>
	);
}
