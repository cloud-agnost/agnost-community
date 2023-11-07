import { DataTable } from '@/components/DataTable';
import {
	OrganizationInvitationsColumns,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import useTable from '@/hooks/useTable';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Invitation } from '@/types';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function OrganizationInvitationTable() {
	const { invitations, setMemberPage, memberPage } = useOrganizationStore();
	const table = useTable({
		data: invitations,
		columns: OrganizationInvitationsColumns,
	});
	return (
		<div className='space-y-4'>
			<OrganizationMembersTableHeader table={table} />
			<InfiniteScroll
				scrollableTarget='settings-scroll'
				next={() => setMemberPage(memberPage + 1)}
				hasMore
				dataLength={invitations.length}
				loader={<div />}
			>
				<DataTable<Invitation> table={table} />
			</InfiniteScroll>
		</div>
	);
}
