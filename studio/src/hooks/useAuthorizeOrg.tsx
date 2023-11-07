import useOrganizationStore from '@/store/organization/organizationStore';
import { getOrgPermission } from '@/utils';
import React from 'react';

export default function useAuthorizeOrg(key: string) {
	const orgs = useOrganizationStore((state) => state.organizations);
	const role = useOrganizationStore((state) => state.organization.role);

	const hasPermission = React.useMemo(() => getOrgPermission(`${role}.org.${key}`), [key, orgs]);

	return hasPermission;
}
