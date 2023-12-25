import { DataTable } from '@/components/DataTable';
import {
	OrganizationMembersColumns,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import { useTable, useUpdateEffect } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
export default function OrganizationMembersTable() {
	const { members } = useOrganizationStore();
	const [searchParams] = useSearchParams();
	const { getOrganizationMembers, organization } = useOrganizationStore();
	const { orgId } = useParams() as Record<string, string>;
	const table = useTable({
		data: members,
		columns: OrganizationMembersColumns,
	});
	const { refetch, isPending } = useQuery({
		queryKey: ['organizationMembers'],
		queryFn: () =>
			getOrganizationMembers({
				organizationId: organization?._id ?? orgId,
				search: searchParams.get('q') as string,
				sortBy: searchParams.get('s') as string,
				sortDir: searchParams.get('d') as string,
				roles: searchParams.get('r')?.split(',') as string[],
			}),
		refetchOnWindowFocus: false,
	});

	useUpdateEffect(() => {
		if (searchParams.get('tab') === 'member') refetch();
	}, [searchParams, searchParams.get('tab')]);
	return (
		<div className='space-y-4'>
			<OrganizationMembersTableHeader table={table} />
			{isPending ? (
				<div className='flex items-center justify-center h-full w-full'>
					<BeatLoader color='#6884FD' size={16} margin={12} />
				</div>
			) : (
				<DataTable<OrganizationMember> table={table} />
			)}
		</div>
	);
}
