import { DataTable } from '@/components/DataTable';
import { OrganizationMembersColumns } from '@/features/Organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
export default function OrganizationMembersTable() {
	const { members } = useOrganizationStore();

	return <DataTable<OrganizationMember> columns={OrganizationMembersColumns} data={members} />;
}
