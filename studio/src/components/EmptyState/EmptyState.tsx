import './emptyState.scss';

interface EmptyStateProps {
	title: string;
	children?: React.ReactNode;
}

export default function EmptyState({ title, children }: EmptyStateProps) {
	return (
		<div className='empty-state'>
			<div className='rounded-xl bg-lighter w-[172px] h-[172px]' />
			<h2 className='empty-state-title'>{title}</h2>
			{children}
		</div>
	);
}
