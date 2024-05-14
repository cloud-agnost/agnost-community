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
	const { cluster, getClusterInfo } = useClusterStore();
	const navigate = useNavigate();
	useEffect(() => {
		if (pathname) {
			if (pathname.split('/').length <= 3) {
				navigate(cluster.cicdEnabled ? 'projects' : 'apps');
			}
		}
	}, [pathname, cluster.cicdEnabled]);

	useQuery({
		queryFn: getClusterInfo,
		queryKey: ['getClusterInfo'],
		enabled: !_.isNil(cluster),
	});

	const menuItems = useMemo(() => {
		if (cluster.cicdEnabled) {
			return ORGANIZATION_MENU_ITEMS;
		}
		return ORGANIZATION_MENU_ITEMS.slice(1);
	}, [cluster.cicdEnabled]);

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
