import React, { useState } from 'react';
import { DataTable } from 'components/DataTable';
import useApplicationStore from '@/store/app/applicationStore';
import { AppInvitationsColumns } from './AppInvitationsColumns';
import { Invitation } from '@/types';
import AppInvitationFilter from './AppInvitationFilter';
import { Row } from '@tanstack/react-table';

function AppInvitations() {
	const { invitations } = useApplicationStore();
	const [selectedRows, setSelectedRows] = useState<Row<Invitation>[]>();

	return (
		<div className='space-y-4'>
			<AppInvitationFilter selectedRows={selectedRows} />
			<DataTable<Invitation>
				columns={AppInvitationsColumns}
				data={invitations}
				setSelectedRows={setSelectedRows}
			/>
		</div>
	);
}

export default AppInvitations;
