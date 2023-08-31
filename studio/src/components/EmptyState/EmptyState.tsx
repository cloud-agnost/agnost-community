import './emptyState.scss';
import { cn } from '@/utils';

interface EmptyStateProps {
	title: string;
	children?: React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
}

export default function EmptyState({ icon, title, className, children }: EmptyStateProps) {
	return (
		<div className={cn('empty-state', className)}>
			{icon ? icon : <div className='rounded-xl bg-lighter w-[172px] h-[172px]' />}
			<h2 className='empty-state-title'>{title}</h2>
			{children}
		</div>
	);
}
