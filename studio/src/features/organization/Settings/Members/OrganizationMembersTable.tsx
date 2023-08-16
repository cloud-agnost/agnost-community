import { DataTable } from '@/components/DataTable';
import { OrganizationMembersColumns } from '@/features/organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { Row } from '@tanstack/react-table';
interface OutletContextTypes {
	setSelectedRows: Dispatch<SetStateAction<Row<OrganizationMember>[]>>;
}
export default function OrganizationMembersTable() {
	const { members, memberPage, setMemberPage } = useOrganizationStore();
	const { setSelectedRows } = useOutletContext() as OutletContextTypes;
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
			<DataTable<OrganizationMember>
				columns={OrganizationMembersColumns}
				data={members}
				setSelectedRows={setSelectedRows}
			/>
		</InfiniteScroll>
	);
}
