import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import { SearchInput } from '@/components/SearchInput';
import { INVITATIONS_SORT_OPTIONS, ORG_MEMBERS_SORT_OPTIONS } from '@/constants';
import { useToast } from '@/hooks';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember, SortOption } from '@/types';
import { FunnelSimple } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { RoleDropdown } from 'components/RoleDropdown';
import { SelectedRowButton } from 'components/Table';
import { useTranslation } from 'react-i18next';
import '../../organization.scss';

export default function OrganizationMembersTableHeader({ table }: { table: Table<any> }) {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canMultipleDelete = useAuthorizeOrg('team.delete');
	const {
		memberSearch,
		memberSort,
		selectedTab,
		deleteMultipleInvitations,
		removeMultipleMembersFromOrganization,
		setMemberSearch,
		setMemberSort,
		setMemberRoleFilter,
	} = useOrganizationStore();

	const sortOptions: SortOption[] =
		selectedTab === 'member' ? ORG_MEMBERS_SORT_OPTIONS : INVITATIONS_SORT_OPTIONS;

	function deleteMulti() {
		if (selectedTab === 'member') {
			removeMultipleMembersFromOrganization({
				userIds: table.getSelectedRowModel().rows?.map((row) => row.original.member._id) ?? [],
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
		} else {
			deleteMultipleInvitations({
				tokens: table.getSelectedRowModel().rows?.map((row) => row.original.token) ?? [],
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
	return (
		<div className='members-filter'>
			<SearchInput
				className='w-80'
				value={memberSearch}
				onSearch={(searchTerm) => {
					setMemberSearch(searchTerm);
				}}
			/>

			<DropdownMenu>
				<RoleDropdown
					type={'org'}
					onChange={(roles) => {
						setMemberRoleFilter(roles);
					}}
				/>
				<DropdownMenuTrigger asChild>
					<Button variant='outline'>
						<FunnelSimple size={16} className='members-filter-icon' />
						{memberSort.name}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-56'>
					{sortOptions.map((sort) => (
						<DropdownMenuCheckboxItem
							key={sort.name}
							checked={memberSort.name === sort.name}
							onCheckedChange={(checked) => {
								if (checked) {
									setMemberSort(sort);
								} else {
									setMemberSort(sortOptions[0]);
								}
							}}
						>
							{sort.name}
						</DropdownMenuCheckboxItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{!!table.getSelectedRowModel().rows?.length && (
				<SelectedRowButton<OrganizationMember>
					table={table}
					onDelete={deleteMulti}
					disabled={!canMultipleDelete}
				/>
			)}
		</div>
	);
}
