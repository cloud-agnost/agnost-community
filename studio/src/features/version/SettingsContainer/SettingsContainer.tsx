import { ReactNode } from 'react';
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
	description,
}: Props) {
	return (
		<div className={cn('flex-1 max-h-full overflow-auto space-y-4', className)}>
			<Description title={pageTitle}>{description}</Description>
			{action && action}
			{children}
		</div>
	);
}
