import React, { useState } from 'react';
import { DataTable } from 'components/DataTable';
import useApplicationStore from '@/store/app/applicationStore';
import { AppInvitationsColumns } from './AppInvitationsColumns';
import { Invitation } from '@/types';
import AppInvitationFilter from './AppInvitationFilter';
import { Row } from '@tanstack/react-table';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ScrollArea } from 'components/ScrollArea';

function AppInvitations() {
	const { invitations } = useApplicationStore();
	const [selectedRows, setSelectedRows] = useState<Row<Invitation>[]>();

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
					<AppInvitationFilter selectedRows={selectedRows} />
					<DataTable<Invitation>
						columns={AppInvitationsColumns}
						data={invitations}
						setSelectedRows={setSelectedRows}
					/>
				</div>
			</InfiniteScroll>
		</div>
	);
}

export default AppInvitations;
