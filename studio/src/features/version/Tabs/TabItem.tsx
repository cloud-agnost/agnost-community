import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { ReactNode } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { TAB_ICON_MAP } from '@/constants';
import { TabTypes } from '@/types';
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
	const IconComponent = TAB_ICON_MAP[type];
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
					{IconComponent && <IconComponent className='w-5 h-5' />}
					{children}
				</div>
			</Link>
			<div className='tab-item-close group relative'>
				{isDirty && (
					<span className='text-default rounded-full bg-base-reverse w-2 h-2 absolute group-hover:invisible' />
				)}
				{closeable && (
					<Button
						iconOnly
						variant='blank'
						onClick={close}
						className='invisible group-hover:visible'
					>
						<X />
					</Button>
				)}
			</div>
		</div>
	);
}
