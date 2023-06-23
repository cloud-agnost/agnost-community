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
	onClick?: () => void;
}

export default function TabItem({ onClick, to, children, icon, closeable, onClose }: TabItemProps) {
	function close() {
		onClose?.();
	}

	return (
		<span className={cn('tab-item', icon && 'icon', closeable && 'closeable')}>
			<NavLink
				title={children?.toString()}
				className='tab-item-link'
				onClick={onClick}
				to={to}
				replace
				end
			>
				{icon}
				<span className='tab-item-link-text'>{children}</span>
			</NavLink>
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
