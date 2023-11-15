import { INVITATIONS_SORT_OPTIONS, PAGE_SIZE } from '@/constants';
import { useToast } from '@/hooks';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import { Invitation } from '@/types';
import { FunnelSimple } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { Button } from 'components/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { RoleDropdown } from 'components/RoleDropdown';
import { SearchInput } from 'components/SearchInput';
import { SelectedRowButton } from 'components/Table';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
interface Props {
	table: Table<Invitation>;
}
function AppInvitationFilter({ table }: Props) {
	const { notify } = useToast();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const role = useApplicationStore((state) => state.application?.role);
	const canMultiDeleteInvite = useAuthorizeApp({
		role,
		key: 'invitation.delete',
	});
	const {
		invitationRoleFilter,
		invitationSearch,
		invitationSort,
		invitationPage,
		getAppInvitations,
		deleteMultipleInvitations,
	} = useApplicationStore();

	function deleteInvitations() {
		const selectedRows = table.getSelectedRowModel().rows;
		if (selectedRows) {
			deleteMultipleInvitations({
				tokens: selectedRows.map((row) => row.original.token),
				onSuccess: () => {
					notify({
						title: t('general.success'),
						description: t('general.invitation.delete'),
						type: 'success',
					});
					table.toggleAllRowsSelected(false);
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
	}

	const getInvitations = useCallback(() => {
		getAppInvitations({
			size: PAGE_SIZE,
			page: invitationPage,
			roles: invitationRoleFilter || [],
			sortBy: invitationSort.value,
			sortDir: invitationSort.sortDir,
			email: invitationSearch,
			status: 'Pending',
		});
	}, [invitationRoleFilter, invitationSearch, invitationSort, invitationPage]);

	useEffect(() => {
		if (searchParams.get('t') === 'invitations') {
			getInvitations();
		}
	}, [getInvitations]);

	return (
		<div className='flex gap-4'>
			<SearchInput
				value={invitationSearch}
				className='flex-1'
				onSearch={(val) =>
					useApplicationStore.setState?.({ invitationSearch: val, invitationPage: 0 })
				}
			/>
			<RoleDropdown
				value={invitationRoleFilter || []}
				type='app'
				onChange={(roles) => useApplicationStore.setState?.({ invitationRoleFilter: roles })}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='outline'>
						<FunnelSimple size={16} className='members-filter-icon' />
						{invitationSort.name}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-56'>
					{INVITATIONS_SORT_OPTIONS.map((sort) => (
						<DropdownMenuCheckboxItem
							key={sort.name}
							checked={invitationSort.name === sort.name}
							onCheckedChange={(checked) => {
								if (checked) useApplicationStore.setState?.({ invitationSort: sort });
								else
									useApplicationStore.setState?.({
										invitationSort: {
											name: t('general.sortOptions.default'),
											value: '',
											sortDir: '',
										},
									});
							}}
						>
							{sort.name}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{!!table.getSelectedRowModel().rows?.length && (
				<SelectedRowButton<Invitation>
					onDelete={deleteInvitations}
					table={table}
					disabled={!canMultiDeleteInvite}
				/>
			)}
		</div>
	);
}

export default AppInvitationFilter;