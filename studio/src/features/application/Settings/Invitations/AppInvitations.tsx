import { useTable, useUpdateEffect } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import { Invitation } from '@/types';
import { DataTable } from 'components/DataTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import AppInvitationFilter from './AppInvitationFilter';
import { AppInvitationsColumns } from './AppInvitationsColumns';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGE_SIZE } from '@/constants';
import { useParams, useSearchParams } from 'react-router-dom';
import { TableLoading } from '@/components/Table/Table';
function AppInvitations() {
	const { invitations, getAppInvitations, lastFetchedInvitationsPage, application } =
		useApplicationStore();
	const [searchParams] = useSearchParams();
	const table = useTable({
		data: invitations,
		columns: AppInvitationsColumns,
	});

	const { orgId } = useParams<{ orgId: string }>();

	const { fetchNextPage, isFetchingNextPage, hasNextPage, refetch } = useInfiniteQuery({
		queryFn: ({ pageParam }) =>
			getAppInvitations({
				page: pageParam,
				size: PAGE_SIZE,
				email: searchParams.get('e') as string,
				sortBy: searchParams.get('s') as string,
				sortDir: searchParams.get('d') as string,
				roles: searchParams.get('r')?.split(',') as string[],
				status: 'Pending',
				orgId,
				appId: application?._id,
			}),
		queryKey: ['applicationInvitations'],
		enabled: searchParams.get('t') === 'invitations',
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			const nextPage = lastPage.length === PAGE_SIZE ? lastFetchedInvitationsPage + 1 : undefined;
			return nextPage;
		},
	});

	useUpdateEffect(() => {
		refetch();
	}, [searchParams]);

	return (
		<div className='p-6 max-h-[85%] overflow-auto' id='invitation-infinite-scroll'>
			<InfiniteScroll
				scrollableTarget='invitation-infinite-scroll'
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={isFetchingNextPage && <TableLoading />}
				dataLength={invitations.length}
			>
				<div className='space-y-4'>
					<AppInvitationFilter table={table} />
					<DataTable<Invitation> table={table} />
				</div>
			</InfiniteScroll>
		</div>
	);
}

export default AppInvitations;
