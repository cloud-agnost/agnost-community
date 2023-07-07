import { ReactNode } from 'react';
import { cn } from '@/utils';
interface SettingsFormItemProps {
	title: string;
	description?: string | null;
	children?: ReactNode;
	className?: string;
	contentClassName?: string;
}
export default function SettingsFormItem({
	title,
	description,
	children,
	contentClassName,
	className,
}: SettingsFormItemProps) {
	return (
		<div className={cn('space-y-6 py-8 max-w-2xl', className)}>
			<div className='text-sm leading-6 text-default tracking-tight font-medium'>{title}</div>
			{description && (
				<p className='text-subtle text-sm tracking-tight font-normal'>{description}</p>
			)}
			<div className={contentClassName}>{children}</div>
		</div>
	);
}
