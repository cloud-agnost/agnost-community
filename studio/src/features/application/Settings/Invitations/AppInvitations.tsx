import useApplicationStore from '@/store/app/applicationStore';
import { Invitation } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AppInvitationFilter from './AppInvitationFilter';
import { AppInvitationsColumns } from './AppInvitationsColumns';

function AppInvitations() {
	const { invitations } = useApplicationStore();
	const [selectedRows, setSelectedRows] = useState<Row<Invitation>[]>();
	const [table, setTable] = useState<Table<Invitation>>();

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
					<AppInvitationFilter selectedRows={selectedRows} table={table as Table<Invitation>} />
					<DataTable<Invitation>
						columns={AppInvitationsColumns}
						data={invitations}
						setSelectedRows={setSelectedRows}
						setTable={setTable}
					/>
				</div>
			</InfiniteScroll>
		</div>
	);
}

export default AppInvitations;
