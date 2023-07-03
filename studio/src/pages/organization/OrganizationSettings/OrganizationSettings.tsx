import { useUpdateEffect } from '@/hooks';
import { OrganizationInvitations, OrganizationMember } from '@/types';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
export default function OrganizationSettings() {
	const [searchParams] = useSearchParams();
	const [page, setPage] = useState<number>(0);
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [isMember, setIsMember] = useState<boolean>(true);
	const [selectedRows, setSelectedRows] =
		useState<Row<OrganizationInvitations | OrganizationMember>[]>();

	useUpdateEffect(() => {
		if (selectedRoles.length || searchParams.get('q')) {
			setPage(0);
		}
	}, [selectedRoles, searchParams.get('q')]);

	return (
		<Outlet
			context={{
				selectedRoles,
				isMember,
				selectedRows,
				page,
				setSelectedRows,
				setSelectedRoles,
				setIsMember,
				setPage,
			}}
		/>
	);
}
