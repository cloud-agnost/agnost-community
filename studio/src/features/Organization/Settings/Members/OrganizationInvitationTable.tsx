import { DataTable } from '@/components/DataTable';
import { OrganizationInvitationsColumns } from '@/features/Organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationInvitations } from '@/types';
import { Row } from '@tanstack/react-table';
import { useOutletContext } from 'react-router-dom';

interface OutletContextTypes {
	setIsMember: (isMember: boolean) => void;
	setSelectedRows: (selectedRows: Row<OrganizationInvitations>[]) => void;
}
export default function OrganizationInvitationTable() {
	const { invitations } = useOrganizationStore();
	const { setSelectedRows } = useOutletContext() as OutletContextTypes;
	return (
		<DataTable
			columns={OrganizationInvitationsColumns}
			data={invitations}
			setSelectedRows={setSelectedRows}
		/>
	);
}
