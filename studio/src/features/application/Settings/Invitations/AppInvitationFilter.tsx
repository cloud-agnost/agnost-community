import React, { useCallback, useEffect } from 'react';
import { SearchInput } from 'components/SearchInput';
import { useTranslation } from 'react-i18next';
import { RoleDropdown } from 'components/RoleDropdown';
import useApplicationStore from '@/store/app/applicationStore';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Button } from 'components/Button';
import { FunnelSimple } from '@phosphor-icons/react';
import { INVITATIONS_SORT_OPTIONS } from '@/constants';
import { Row } from '@tanstack/react-table';
import { Invitation } from '@/types';
import { SelectedRowDropdown } from 'components/Table';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks';

interface Props {
	selectedRows: Row<Invitation>[] | undefined;
}
function AppInvitationFilter({ selectedRows }: Props) {
	const { notify } = useToast();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();

	const {
		getAppInvitations,
		invitationRoleFilter,
		invitationSearch,
		invitationSort,
		deleteMultipleInvitations,
	} = useApplicationStore();

	function deleteInvitations() {
		if (selectedRows) {
			deleteMultipleInvitations({
				tokens: selectedRows.map((row) => row.original.token),
				onSuccess: () => {
					notify({
						title: t('general.success'),
						description: t('general.invitation.delete'),
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
	}

	const getInvitations = useCallback(() => {
		getAppInvitations({
			size: 10,
			page: 0,
			role: invitationRoleFilter,
			sortBy: invitationSort.value,
			sortDir: invitationSort.sortDir,
			email: invitationSearch,
		});
	}, [invitationRoleFilter, invitationSearch, invitationSort]);

	useEffect(() => {
		if (searchParams.get('t') === 'invitations') {
			getInvitations();
		}
	}, [getInvitations]);

	return (
		<div className='flex gap-4'>
			<SearchInput
				className='flex-1'
				onSearch={(val) => useApplicationStore.setState?.({ invitationSearch: val })}
			/>
			<RoleDropdown
				type='app'
				onCheck={(role) => useApplicationStore.setState?.({ invitationRoleFilter: role })}
				onUncheck={() => useApplicationStore.setState?.({ invitationRoleFilter: '' })}
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
			{!!selectedRows?.length && (
				<SelectedRowDropdown
					onDelete={deleteInvitations}
					selectedRowLength={selectedRows?.length}
				/>
			)}
		</div>
	);
}

export default AppInvitationFilter;
