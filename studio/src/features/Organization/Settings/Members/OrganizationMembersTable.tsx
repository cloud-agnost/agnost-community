import { DataTable } from '@/components/DataTable';
import { OrganizationMembersColumns } from '@/features/organization';
import useOrganizationStore from '@/store/organization/organizationStore';
export default function OrganizationMembersTable() {
	const { members } = useOrganizationStore();

	return <DataTable columns={OrganizationMembersColumns} data={members} />;
}
