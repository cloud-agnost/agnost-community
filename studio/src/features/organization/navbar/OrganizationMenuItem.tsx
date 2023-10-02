import { cn } from '@/utils';
import { Link } from 'react-router-dom';
import './organizationMenu.scss';

interface OrganizationMenuItemProps {
	onClick?: () => void;
	active?: boolean;
	item: {
		name: string;
		href: string;
		icon?: React.ElementType;
	};
}

export default function OrganizationMenuItem({ item, active, onClick }: OrganizationMenuItemProps) {
	return (
		<li className={cn('org-menu-item', active && 'active')}>
			<Link to={item.href} className='org-menu-link' onClick={onClick}>
				{item.icon && <item.icon size={24} className='org-menu-icon' />}
				<span className='org-menu-item-name'>{item.name}</span>
			</Link>
		</li>
	);
}
