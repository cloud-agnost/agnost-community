import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import { PilTab } from '@/components/PilTab';
import { SearchInput } from '@/components/SearchInput';
import { Resend } from '@/components/icons';
import { INVITATIONS_SORT_OPTIONS, ORG_MEMBERS_SORT_OPTIONS } from '@/constants';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import useTypeStore from '@/store/types/typeStore';
import { Invitation, OrganizationMember, SortOption } from '@/types';
import { Funnel, FunnelSimple, Trash } from '@phosphor-icons/react';
import { Row } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import '../../organization.scss';
import { SetStateAction, Dispatch } from 'react';

interface RowTypes extends Omit<Invitation, 'role'>, OrganizationMember {}

interface OutletContextTypes {
	selectedRoles: string[];
	isMember: boolean;
	selectedRows: Row<RowTypes>[];
	setSelectedRoles: Dispatch<SetStateAction<string[]>>;
	setIsMember: Dispatch<SetStateAction<boolean>>;
}

export default function OrganizationMembersTableHeader() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { orgRoles } = useTypeStore();
	const selectedRoles = searchParams.get('r')?.split(',') ?? [];
	const { isMember, setIsMember, selectedRows } = useOutletContext() as OutletContextTypes;
	const { notify } = useToast();
	const sortOptions: SortOption[] = isMember ? ORG_MEMBERS_SORT_OPTIONS : INVITATIONS_SORT_OPTIONS;
	const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0] as SortOption);
	const { deleteMultipleInvitations, removeMultipleMembersFromOrganization } =
		useOrganizationStore();
	useEffect(() => {
		if (searchParams.get('s')) {
			const sort =
				(sortOptions.find(
					(s) => s.value === searchParams.get('s') && s.sortDir === searchParams.get('d'),
				) as SortOption) ?? sortOptions[0];
			if (!sort.sortDir) {
				searchParams.delete('d');
				setSearchParams(searchParams);
			}
			setSelectedSort(sort);
		}
	}, [searchParams.get('s'), searchParams.get('d')]);
	return (
		<div className='members-header'>
			<div className='members-tab'>
				<PilTab
					tabs={[
						{
							label: 'Members',
							onClick: () => {
								setIsMember(true);
							},
						},
						{
							label: 'Pending Invitations',
							onClick: () => {
								setIsMember(false);
							},
						},
					]}
				/>
			</div>
			<div className='members-filter'>
				<SearchInput
					placeholder='Search'
					className='w-80'
					value={searchParams.get('q') ?? ''}
					onSearch={(searchTerm) => {
						if (searchTerm) {
							searchParams.set('q', searchTerm);
						} else {
							searchParams.delete('q');
						}
						setSearchParams(searchParams);
					}}
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline'>
							<Funnel size={16} weight='fill' className='members-filter-icon' />
							{selectedRoles.length > 0 ? `${selectedRoles.length} selected` : 'Filter'}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-56'>
						{orgRoles.map((role) => (
							<DropdownMenuCheckboxItem
								key={role}
								checked={searchParams.get('r')?.includes(role)}
								onCheckedChange={(checked) => {
									if (checked) {
										searchParams.set('r', [...selectedRoles, role].join(','));
									} else {
										const roles = selectedRoles.filter((r) => r !== role).join(',');
										if (roles.length)
											searchParams.set('r', selectedRoles.filter((r) => r !== role).join(','));
										else searchParams.delete('r');
									}
									setSearchParams(searchParams);
								}}
							>
								{role}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline'>
							<FunnelSimple size={16} className='members-filter-icon' />
							{selectedSort.name}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-56'>
						{sortOptions.map((sort) => (
							<DropdownMenuCheckboxItem
								key={sort.name}
								checked={selectedSort.name === sort.name}
								onCheckedChange={(checked) => {
									if (checked) {
										setSelectedSort(sort);
										searchParams.set('s', sort.value as string);
										if (sort?.sortDir) {
											searchParams.set('d', sort.sortDir);
										}
										setSearchParams(searchParams);
									} else {
										searchParams.delete('s');
										if (searchParams.get('d')) searchParams.delete('d');
										setSearchParams(searchParams);
									}
								}}
							>
								{sort.name}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline'>
							{selectedRows && selectedRows?.length > 0 ? (
								<span>{selectedRows?.length} selected</span>
							) : (
								<span>Actions</span>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-56'>
						<DropdownMenuItem
							onClick={() => {
								if (isMember) {
									removeMultipleMembersFromOrganization({
										userIds: selectedRows?.map((row) => row.original.member._id) ?? [],
										onSuccess: () => {
											notify({
												title: 'Invitations deleted',
												description: 'The invitations were successfully deleted',
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
												title: 'Invitations deleted',
												description: 'The invitations were successfully deleted',
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
							}}
						>
							<Trash size={16} className='members-filter-icon' />
							Delete All
						</DropdownMenuItem>
						{!isMember && (
							<DropdownMenuItem>
								<Resend className='members-filter-resend' />
								Resend All
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
