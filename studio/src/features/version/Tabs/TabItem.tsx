import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { Button } from 'components/Button';

interface TabItemProps {
	to: string;
	children: ReactNode;
	icon?: ReactNode;
	closeable?: boolean;
	onClose?: () => void;
	onClick?: () => void;
	active?: boolean;
}

export default function TabItem({
	onClick,
	active,
	to,
	children,
	icon,
	closeable,
	onClose,
	...props
}: TabItemProps) {
	function close() {
		onClose?.();
	}

	return (
		<span className={cn('tab-item', icon && 'icon', closeable && 'closeable')} {...props}>
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
		</span>
	);
}
