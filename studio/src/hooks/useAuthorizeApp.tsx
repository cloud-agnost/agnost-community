import React from 'react';
import { AppRoles } from '@/types';
import { getAppPermission } from '@/utils';
import useApplicationStore from '@/store/app/applicationStore';

interface Props {
	role?: AppRoles;
	key: string;
}

export default function useAuthorizeApp({ role, key }: Props) {
	const apps = useApplicationStore((state) => state.applications);
	const hasPermission = React.useMemo(() => getAppPermission(`${role}.app.${key}`), [role, apps]);

	return hasPermission as boolean;
}
