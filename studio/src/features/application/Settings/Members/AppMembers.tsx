import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { SearchInput } from '@/components/SearchInput';
import { useTable } from '@/hooks';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import useClusterStore from '@/store/cluster/clusterStore';
import { Application, ApplicationMember } from '@/types';
import { notify } from '@/utils';
import { Table } from '@tanstack/react-table';
import { RoleDropdown } from 'components/RoleDropdown';
import { SelectedRowButton } from 'components/Table';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { AppMembersTableColumns } from './AppMembersTableColumns';
export default function MainAppMembers() {
	const [searchParams] = useSearchParams();
	const {
		applicationTeam,
		application,
		openInviteMemberDrawer,
		removeMultipleAppMembers,
		getAppTeamMembers,
		isEditAppOpen,
	} = useApplicationStore();
	const filteredMembers = useMemo(() => {
		if (searchParams.get('m')) {
			const query = new RegExp(searchParams.get('m') as string, 'i');
			return applicationTeam.filter((val) => RegExp(query).exec(val.member.name));
		}
		return applicationTeam;
	}, [searchParams.get('m'), applicationTeam]);

	const table = useTable({
		data: filteredMembers,
		columns: AppMembersTableColumns,
	});
	const { canClusterSendEmail } = useClusterStore();
	const canMultiDelete = useAuthorizeApp('team.delete');
	const { t } = useTranslation();
	const { orgId } = useParams() as Record<string, string>;

	useEffect(() => {
		if (isEditAppOpen) {
			getAppTeamMembers({
				appId: application?._id as string,
				orgId,
			});
		}
	}, [isEditAppOpen]);

	function removeMultipleMembers() {
		const userIds = table.getSelectedRowModel().rows?.map((row) => row.original.member._id);
		removeMultipleAppMembers({
			userIds,
			orgId,
			appId: application?._id as string,
			onSuccess: () => {
				notify({
					title: t('general.success'),
					description: t('general.member.delete'),
					type: 'success',
				});
				table?.toggleAllRowsSelected(false);
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
			<div className='flex items-center gap-4'>
				<SearchInput
					className='flex-1'
					placeholder={t('general.search') as string}
					urlKey='m'
					value={searchParams.get('m') as string}
				/>
				<div className='flex items-center gap-4'>
					{!!table.getSelectedRowModel().rows?.length && (
						<SelectedRowButton<ApplicationMember>
							onDelete={removeMultipleMembers}
							table={table as Table<ApplicationMember>}
							disabled={!canMultiDelete}
						/>
					)}
					<RoleDropdown
						type={'app'}
						onChange={(roles) => table?.getColumn('role')?.setFilterValue(roles)}
					/>
					{canClusterSendEmail && (
						<Button
							variant='primary'
							onClick={() => openInviteMemberDrawer(application as Application)}
						>
							{t('application.edit.invite')}
						</Button>
					)}
				</div>
			</div>
			<DataTable<ApplicationMember> table={table} />
		</div>
	);
}
