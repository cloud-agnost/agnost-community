import { ORGANIZATION_MENU_ITEMS } from '@/constants';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrganizationMenuItem from './OrganizationMenuItem';
import './organizationMenu.scss';
import useClusterStore from '@/store/cluster/clusterStore';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
export default function OrganizationMenu() {
	const { pathname } = useLocation();
	const { checkCICDStatus, isCiCdEnabled } = useClusterStore();
	const navigate = useNavigate();
	useEffect(() => {
		if (pathname) {
			if (pathname.split('/').length <= 3) {
				navigate(isCiCdEnabled ? 'projects' : 'apps');
			}
		}
	}, [pathname, isCiCdEnabled]);

	useQuery({
		queryFn: checkCICDStatus,
		queryKey: ['checkCICDStatus'],
	});

	const menuItems = useMemo(() => {
		if (isCiCdEnabled) {
			return ORGANIZATION_MENU_ITEMS;
		}
		return ORGANIZATION_MENU_ITEMS.slice(1);
	}, [isCiCdEnabled]);

	return (
		<nav className='org-menu'>
			{menuItems.map((item) => {
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
