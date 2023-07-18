import { RequireAuth } from '@/router';
import { Invitation, OrganizationMember } from '@/types';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function OrganizationSettings() {
	const [selectedRows, setSelectedRows] = useState<Row<Invitation | OrganizationMember>[]>();

	return (
		<RequireAuth>
			<Outlet
				context={{
					selectedRows,
					setSelectedRows,
				}}
			/>
		</RequireAuth>
	);
}
