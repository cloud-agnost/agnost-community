import { ReactNode } from 'react';
import { cn } from '@/utils';
interface SettingsFormItemProps {
	title: string;
	description?: string | null;
	children?: ReactNode;
	className?: string;
	contentClassName?: string;
	twoColumns?: boolean;
}
export default function SettingsFormItem({
	title,
	description,
	children,
	contentClassName,
	className,
	twoColumns = false,
}: SettingsFormItemProps) {
	return (
		<div
			className={cn(
				'space-y-6 py-8 max-w-2xl',
				twoColumns && 'flex justify-between gap-10',
				className,
			)}
		>
			<div>
				<div className='text-sm leading-6 text-default tracking-tight font-medium'>{title}</div>
				{description && (
					<p className='text-subtle text-sm tracking-tight font-normal'>{description}</p>
				)}
			</div>
			<div className={contentClassName}>{children}</div>
		</div>
	);
}
