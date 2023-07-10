import { INVITATIONS_SORT_OPTIONS, PAGE_SIZE } from '@/constants';
import { useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import { Invitation } from '@/types';
import { Broom, FunnelSimple } from '@phosphor-icons/react';
import { Row } from '@tanstack/react-table';
import { Button } from 'components/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { RoleDropdown } from 'components/RoleDropdown';
import { SearchInput } from 'components/SearchInput';
import { SelectedRowDropdown } from 'components/Table';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

interface Props {
	selectedRows: Row<Invitation>[] | undefined;
}
function AppInvitationFilter({ selectedRows }: Props) {
	const { notify } = useToast();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();

	const {
		invitationRoleFilter,
		invitationSearch,
		invitationSort,
		invitationPage,
		getAppInvitations,
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
	function clearFilters() {
		useApplicationStore.setState?.({
			invitationSearch: '',
			invitationRoleFilter: [],
			invitationSort: {
				name: t('general.sortOptions.default'),
				value: '',
				sortDir: '',
			},
		});
	}
	const getInvitations = useCallback(() => {
		getAppInvitations({
			size: PAGE_SIZE,
			page: invitationPage,
			roles: invitationRoleFilter || [],
			sortBy: invitationSort.value,
			sortDir: invitationSort.sortDir,
			email: invitationSearch,
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
			{!!selectedRows?.length && (
				<SelectedRowDropdown
					onDelete={deleteInvitations}
					selectedRowLength={selectedRows?.length}
				/>
			)}
			{invitationSearch ||
			!invitationRoleFilter ||
			invitationRoleFilter.length ||
			invitationSort.name !== t('general.sortOptions.default') ? (
				<Button variant='outline' iconOnly onClick={clearFilters}>
					<Broom size={16} className='members-filter-icon' />
					{t('general.clear')}
				</Button>
			) : null}
		</div>
	);
}

export default AppInvitationFilter;
