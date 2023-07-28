import { DataTable } from '@/components/DataTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { OrganizationInvitationsColumns } from '@/features/Organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Invitation } from '@/types';
import { Row } from '@tanstack/react-table';
import { useOutletContext } from 'react-router-dom';
import { SetStateAction, Dispatch } from 'react';
interface OutletContextTypes {
	setSelectedRows: Dispatch<SetStateAction<Row<Invitation>[]>>;
}
export default function OrganizationInvitationTable() {
	const { invitations, setMemberPage, memberPage } = useOrganizationStore();
	const { setSelectedRows } = useOutletContext() as OutletContextTypes;

	return (
		<InfiniteScroll
			scrollableTarget='settings-scroll'
			next={() => setMemberPage(memberPage + 1)}
			hasMore
			dataLength={invitations.length}
			loader={<div />}
		>
			<DataTable<Invitation>
				columns={OrganizationInvitationsColumns}
				data={invitations}
				setSelectedRows={setSelectedRows}
			/>
		</InfiniteScroll>
	);
}
