import { ReactNode } from 'react';
import './settingsContainer.scss';
import { cn } from '@/utils';

interface Props {
	children: ReactNode;
	pageTitle: string;
	action?: ReactNode;
	className?: string;
	contentClassName?: string;
}
export default function SettingsContainer({
	children,
	pageTitle,
	action,
	className,
	contentClassName,
}: Props) {
	return (
		<div className={cn('setting-container', className)}>
			<div className='setting-container-header'>
				<div className='setting-container-header-info'>
					<h3 className='setting-container-header-info-title'>{pageTitle}</h3>
				</div>
				{action && <div className='setting-container-header-action'>{action}</div>}
			</div>
			<div
				id='setting-container-content'
				className={cn('setting-container-content', contentClassName)}
			>
				{children}
			</div>
		</div>
	);
}
