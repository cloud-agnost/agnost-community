import { useTable } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import { Invitation } from '@/types';
import { DataTable } from 'components/DataTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import AppInvitationFilter from './AppInvitationFilter';
import { AppInvitationsColumns } from './AppInvitationsColumns';

function AppInvitations() {
	const { invitations } = useApplicationStore();
	const table = useTable({
		data: invitations,
		columns: AppInvitationsColumns,
	});

	return (
		<div className='p-6 max-h-[85%] overflow-auto' id='invitation-infinite-scroll'>
			<InfiniteScroll
				scrollableTarget='invitation-infinite-scroll'
				next={() => {
					useApplicationStore.setState?.({
						invitationPage: useApplicationStore.getState?.().invitationPage + 1,
					});
				}}
				hasMore={true}
				loader={<></>}
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
