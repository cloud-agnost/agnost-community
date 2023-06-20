import { NavLink } from 'react-router-dom';
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
}

export default function TabItem({ to, children, icon, closeable, onClose }: TabItemProps) {
	function close() {
		onClose?.();
	}

	return (
		<div className={cn('tab-item', icon && 'icon', closeable && 'closeable')}>
			<NavLink className='tab-item-link' to={to}>
				{icon}
				{children}
			</NavLink>
			{closeable && (
				<Button iconOnly className='tab-item-close' variant='blank' onClick={close}>
					<X />
				</Button>
			)}
		</div>
	);
}
