import { ORGANIZATION_MENU_ITEMS } from '@/constants';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrganizationMenuItem from './OrganizationMenuItem';
import './organizationMenu.scss';
export default function OrganizationMenu() {
	const { pathname } = useLocation();

	const navigate = useNavigate();
	useEffect(() => {
		if (pathname) {
			if (pathname.split('/').length <= 3) {
				navigate('apps');
			}
		}
	}, [pathname]);
	return (
		<nav className='org-menu'>
			{ORGANIZATION_MENU_ITEMS.map((item) => {
				return (
					<OrganizationMenuItem
						key={item.name}
						item={item}
						active={pathname.includes(item.href)}
						isNavigate
					/>
				);
			})}
		</nav>
	);
}
