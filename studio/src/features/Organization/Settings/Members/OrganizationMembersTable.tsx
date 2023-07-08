import { DataTable } from '@/components/DataTable';
import { OrganizationMembersColumns } from '@/features/organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
import InfiniteScroll from 'react-infinite-scroll-component';
export default function OrganizationMembersTable() {
	const { members, memberPage, setMemberPage } = useOrganizationStore();

	return (
		<InfiniteScroll
			scrollableTarget='settings-scroll'
			next={() => {
				setMemberPage(memberPage + 1);
			}}
			hasMore
			dataLength={members.length}
			loader={<div />}
		>
			<DataTable<OrganizationMember> columns={OrganizationMembersColumns} data={members} />
		</InfiniteScroll>
	);
}
