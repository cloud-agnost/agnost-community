import { DataTable } from '@/components/DataTable';
import {
	OrganizationMembersColumns,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import { useTable } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';

export default function OrganizationMembersTable() {
	const { members } = useOrganizationStore();
	const table = useTable({
		data: members,
		columns: OrganizationMembersColumns,
	});
	return (
		<div className='space-y-4'>
			<OrganizationMembersTableHeader table={table} />
			<DataTable<OrganizationMember> table={table} />
		</div>
	);
}
