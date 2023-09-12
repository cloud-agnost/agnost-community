import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
interface TabItemProps {
	to: string;
	children: ReactNode;
	icon?: ReactNode;
	closeable?: boolean;
	onClose?: () => void;
	onClick?: () => void;
	active?: boolean;
	provided: DraggableProvided;
	snapshot: DraggableStateSnapshot;
}

export default function TabItem({
	onClick,
	active,
	to,
	children,
	icon,
	closeable,
	onClose,
	provided,
	snapshot,
	...props
}: TabItemProps) {
	function close() {
		onClose?.();
	}

	return (
		<div
			className={cn('tab-item', icon && 'icon', closeable && 'closeable')}
			{...props}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			ref={provided.innerRef}
		>
			<Link
				title={children?.toString()}
				className={cn('tab-item-link', active && 'active')}
				onClick={onClick}
				to={to}
			>
				{icon}
				<span className='tab-item-link-text'>{children}</span>
			</Link>
			{closeable && (
				<div className='tab-item-close'>
					<Button iconOnly variant='blank' onClick={close}>
						<X />
					</Button>
				</div>
			)}
		</div>
	);
}
