import { Button } from '@/components/Button';
import { cn } from '@/utils';
import { Icon } from '@phosphor-icons/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './organizationMenu.scss';
interface OrganizationMenuItemProps {
	onClick?: () => void;
	active?: boolean;
	item: {
		name: string;
		href: string;
		Icon?: Icon;
	};
	isNavigate?: boolean;
	urlKey?: string;
}

export default function OrganizationMenuItem({
	item: { name, href, Icon },
	active,
	onClick,
	urlKey,
	isNavigate = false,
}: OrganizationMenuItemProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	function clickHandler() {
		onClick?.();
		if (isNavigate) {
			navigate(href);
		} else {
			searchParams.set(urlKey ?? 't', href);
			setSearchParams(searchParams);
		}
	}
	return (
		<li className={cn('org-menu-item', active && 'active')}>
			<Button variant='blank' onClick={clickHandler} className='org-menu-link rounded-none'>
				{Icon && <Icon size={20} className='org-menu-icon w-5 h-5' />}
				<span className='org-menu-item-name'>{name}</span>
			</Button>
		</li>
	);
}
