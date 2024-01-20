import { Button } from '@/components/Button';
import { useTabIcon } from '@/hooks';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
interface TabItemProps {
	to: string;
	children: ReactNode;
	icon?: ReactNode;
	closeable?: boolean;
	onClose?: () => void;
	onClick?: () => void;
	active?: boolean;
	provided: DraggableProvided;
	isDirty?: boolean;
	title: string;
	type: TabTypes;
}

export default function TabItem({
	onClick,
	active,
	to,
	children,
	closeable,
	onClose,
	provided,
	isDirty,
	title,
	type,
	...props
}: TabItemProps) {
	function close() {
		onClose?.();
	}
	const getTabIcon = useTabIcon('w-3.5 h-3.5');
	return (
		<div
			className={cn('tab-item icon', closeable && 'closeable', active && 'active')}
			{...props}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			ref={provided.innerRef}
			title={title}
			{...(active && { 'data-active': true })}
		>
			<Link title={title} className={cn('tab-item-link')} onClick={onClick} to={to}>
				<div className='flex items-center gap-2'>
					{getTabIcon(type)}
					{children}
				</div>
			</Link>
			<div className='tab-item-close group relative'>
				{isDirty && (
					<span className='text-default rounded-full bg-base-reverse w-2 h-2 absolute group-hover:invisible' />
				)}
				{closeable && (
					<Button variant='icon' onClick={close} className='!h-[unset]'>
						<X size={12} />
					</Button>
				)}
			</div>
		</div>
	);
}
