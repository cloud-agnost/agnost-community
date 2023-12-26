import { ReactNode } from 'react';
import './settingsContainer.scss';
import { cn } from '@/utils';
import { Description } from '@/components/Description';

interface Props {
	children: ReactNode;
	pageTitle: string;
	action?: ReactNode;
	className?: string;
	contentClassName?: string;
	description?: ReactNode;
}
export default function SettingsContainer({
	children,
	pageTitle,
	action,
	className,
	contentClassName,
	description,
}: Props) {
	return (
		<div className={cn('setting-container', className)}>
			<div className='setting-container-header'>
				<div className='setting-container-header-info'>
					<Description title={pageTitle}>{description}</Description>
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
