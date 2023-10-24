import { Button } from '@/components/Button';
import { cn } from '@/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './organizationMenu.scss';
interface OrganizationMenuItemProps {
	onClick?: () => void;
	active?: boolean;
	item: {
		name: string;
		href: string;
		icon?: React.ElementType;
	};
	isNavigate?: boolean;
}

export default function OrganizationMenuItem({
	item,
	active,
	onClick,
	isNavigate = false,
}: OrganizationMenuItemProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	function clickHandler() {
		onClick?.();
		if (isNavigate) {
			navigate(item.href);
		} else {
			searchParams.set('t', item.href);
			setSearchParams(searchParams);
		}
	}
	return (
		<li className={cn('org-menu-item', active && 'active')}>
			<Button variant='blank' onClick={clickHandler} className='org-menu-link rounded-none'>
				{item.icon && <item.icon size={24} className='org-menu-icon' />}
				<span className='org-menu-item-name'>{item.name}</span>
			</Button>
		</li>
	);
}
