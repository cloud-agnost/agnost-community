import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import {
	OrganizationInvitationsColumns,
	OrganizationMembersTableHeader,
} from '@/features/organization';
import { useUpdateEffect } from '@/hooks';
import useTable from '@/hooks/useTable';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Invitation } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
export default function OrganizationInvitationTable() {
	const [searchParams] = useSearchParams();
	const { invitations, lastFetchedInvitationsPage, getOrganizationInvitations } =
		useOrganizationStore();

	const table = useTable({
		data: invitations,
		columns: OrganizationInvitationsColumns,
	});

	const { fetchNextPage, isFetchingNextPage, hasNextPage, refetch, isFetching } = useInfiniteQuery({
		queryFn: ({ pageParam }) =>
			getOrganizationInvitations({
				page: pageParam,
				size: PAGE_SIZE,
				email: searchParams.get('q') as string,
				sortBy: searchParams.get('s') as string,
				sortDir: searchParams.get('d') as string,
				roles: searchParams.get('r')?.split(',') as string[],
				status: 'Pending',
			}),
		queryKey: ['organizationInvitations'],
		initialPageParam: 0,
		enabled: searchParams.get('tab') === 'invitation',
		getNextPageParam: (lastPage) => {
			const nextPage = lastPage.length === PAGE_SIZE ? lastFetchedInvitationsPage + 1 : undefined;
			return nextPage;
		},
	});

	useUpdateEffect(() => {
		if (searchParams.get('tab') === 'invitation') refetch();
	}, [searchParams, searchParams.get('tab')]);

	return (
		<div className='space-y-4'>
			<OrganizationMembersTableHeader table={table} />
			{isFetching ? (
				<div className='flex items-center justify-center h-full w-full'>
					<BeatLoader color='#6884FD' size={16} margin={12} />
				</div>
			) : (
				<InfiniteScroll
					scrollableTarget='settings-scroll'
					next={fetchNextPage}
					hasMore={hasNextPage}
					dataLength={invitations.length}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable<Invitation> table={table} />
				</InfiniteScroll>
			)}
		</div>
	);
}
