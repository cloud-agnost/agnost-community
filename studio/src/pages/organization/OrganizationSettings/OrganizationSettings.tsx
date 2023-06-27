import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { OrganizationInvitations, OrganizationMember } from '@/types';
export default function OrganizationSettings() {
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [isMember, setIsMember] = useState<boolean>(true);
	const [selectedRows, setSelectedRows] =
		useState<Row<OrganizationInvitations | OrganizationMember>[]>();
	return (
		<Outlet
			context={{
				selectedRoles,
				isMember,
				selectedRows,
				setSelectedRows,
				setSelectedRoles,
				setIsMember,
			}}
		/>
	);
}
