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
import useOrganizationStore from '@/store/organization/organizationStore';
import { Invitation, OrganizationMember, SortOption } from '@/types';
import { FunnelSimple } from '@phosphor-icons/react';
import { Row } from '@tanstack/react-table';
import { RoleDropdown } from 'components/RoleDropdown';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import '../../organization.scss';
import { SelectedRowButton } from 'components/Table';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';

interface RowTypes extends Omit<Invitation, 'role'>, OrganizationMember {}

interface OutletContextTypes {
	selectedRows: Row<RowTypes>[];
	setSelectedRows: Dispatch<SetStateAction<Row<RowTypes>[]>>;
}

export default function OrganizationMembersTableHeader() {
	const { t } = useTranslation();
	const { selectedRows, setSelectedRows } = useOutletContext() as OutletContextTypes;
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
				userIds: selectedRows?.map((row) => row.original.member._id) ?? [],
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
				tokens: selectedRows?.map((row) => row.original.token) ?? [],
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
		setSelectedRows([]);
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
			{selectedRows?.length && (
				<SelectedRowButton<OrganizationMember>
					onDelete={deleteMulti}
					selectedRowLength={selectedRows?.length}
					disabled={!canMultipleDelete}
				/>
			)}
		</div>
	);
}
