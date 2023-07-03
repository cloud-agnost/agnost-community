import { DataTable } from '@/components/DataTable';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { OrganizationInvitationsColumns } from '@/features/Organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationInvitations } from '@/types';
import { Row } from '@tanstack/react-table';
import { useOutletContext } from 'react-router-dom';
import { SetStateAction, Dispatch } from 'react';
interface OutletContextTypes {
	setSelectedRows: Dispatch<SetStateAction<Row<OrganizationInvitations>[]>>;
	setPage: Dispatch<SetStateAction<number>>;
}
export default function OrganizationInvitationTable() {
	const { invitations } = useOrganizationStore();
	const { setSelectedRows, setPage } = useOutletContext() as OutletContextTypes;

	return (
		<InfiniteScroll items={invitations} endOfList={() => setPage((prev) => prev + 1)}>
			<DataTable
				columns={OrganizationInvitationsColumns}
				data={invitations}
				setSelectedRows={setSelectedRows}
			/>
		</InfiniteScroll>
	);
}
