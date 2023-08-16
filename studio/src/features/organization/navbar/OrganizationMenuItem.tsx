import { cn } from '@/utils';
import { Link } from 'react-router-dom';
import './organizationMenu.scss';

interface OrganizationMenuItemProps {
	active?: boolean;
	item: {
		name: string;
		href: string;
		icon?: React.ElementType;
	};
}

export default function OrganizationMenuItem({ item, active }: OrganizationMenuItemProps) {
	return (
		<li className={cn('org-menu-item', active && 'active')}>
			<Link to={item.href} className='org-menu-link'>
				{item.icon && <item.icon size={24} className='org-menu-icon' />}
				<span className='org-menu-item-name'>{item.name}</span>
			</Link>
		</li>
	);
}
