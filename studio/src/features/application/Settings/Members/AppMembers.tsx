import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { SearchInput } from '@/components/SearchInput';
import useApplicationStore from '@/store/app/applicationStore';
import { Application, ApplicationMember } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMembersTableColumns } from './AppMembersTableColumns';
import { SelectedRowDropdown } from 'components/Table';
import { notify } from '@/utils';
import { RoleDropdown } from 'components/RoleDropdown';
import useClusterStore from '@/store/cluster/clusterStore';
export default function AppMembers() {
	const { applicationTeam, application, openInviteMemberDrawer, removeMultipleAppMembers } =
		useApplicationStore();
	const { canClusterSendEmail } = useClusterStore();
	const [table, setTable] = useState<Table<ApplicationMember>>();
	const [selectedRows, setSelectedRows] = useState<Row<ApplicationMember>[]>();
	const { t } = useTranslation();

	function removeMultipleMembers() {
		const userIds = selectedRows?.map((row) => row.original.member._id);
		removeMultipleAppMembers({
			userIds,
			onSuccess: () => {
				setSelectedRows([]);
				notify({
					title: t('general.success'),
					description: t('general.member.delete'),
					type: 'success',
				});
			},
			onError: ({ error, details }) => {
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}
	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between gap-4'>
				<SearchInput placeholder={t('general.search') as string} />
				<div className='flex items-center gap-4'>
					{!!selectedRows?.length && (
						<SelectedRowDropdown
							onDelete={removeMultipleMembers}
							selectedRowLength={selectedRows?.length}
							table={table as Table<ApplicationMember>}
						/>
					)}
					<RoleDropdown
						type={'app'}
						onChange={(roles) => {
							table?.getColumn('role')?.setFilterValue(roles);
						}}
					/>
					{canClusterSendEmail && (
						<Button
							variant='primary'
							onClick={() => {
								openInviteMemberDrawer(application as Application);
							}}
						>
							{t('application.edit.invite')}
						</Button>
					)}
				</div>
			</div>
			<DataTable<ApplicationMember>
				columns={AppMembersTableColumns}
				data={applicationTeam}
				setTable={setTable}
				setSelectedRows={setSelectedRows}
			/>
		</div>
	);
}
