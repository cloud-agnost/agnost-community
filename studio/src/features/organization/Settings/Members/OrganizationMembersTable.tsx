import { DataTable } from '@/components/DataTable';
import {
	OrganizationMembersColumns,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import { useTable } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function OrganizationMembersTable() {
	const { members, memberPage, setMemberPage } = useOrganizationStore();
	const table = useTable({
		data: members,
		columns: OrganizationMembersColumns,
	});
	return (
		<div className='space-y-4'>
			<OrganizationMembersTableHeader table={table} />
			<InfiniteScroll
				scrollableTarget='settings-scroll'
				next={() => setMemberPage(memberPage + 1)}
				hasMore
				dataLength={members.length}
				loader={<div />}
			>
				<DataTable<OrganizationMember> table={table} />
			</InfiniteScroll>
		</div>
	);
}
