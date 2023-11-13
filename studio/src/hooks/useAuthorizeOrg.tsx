import useOrganizationStore from '@/store/organization/organizationStore';
import { getOrgPermission } from '@/utils';
import React from 'react';

export default function useAuthorizeOrg(key: string) {
	const orgs = useOrganizationStore((state) => state.organizations);

	const hasPermission = React.useMemo(() => getOrgPermission(key), [key, orgs]);

	return hasPermission;
}
