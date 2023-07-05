import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import { SearchInput } from '@/components/SearchInput';
import useApplicationStore from '@/store/app/applicationStore';
import useTypeStore from '@/store/types/typeStore';
import { ApplicationMember } from '@/types';
import { Funnel, Trash } from '@phosphor-icons/react';
import { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMembersTableColumns } from './AppMembersTableColumns';
export default function AppMembers() {
	const { appRoles } = useTypeStore();
	const { applicationTeam } = useApplicationStore();
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [table, setTable] = useState<Table<ApplicationMember>>();
	const { t } = useTranslation();

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between gap-4'>
				<SearchInput placeholder={t('general.search') as string} />
				<div className='flex items-center gap-4'>
					{!!table?.getSelectedRowModel().rows?.length && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='outline'>
									{table?.getSelectedRowModel().rows &&
									table?.getSelectedRowModel().rows?.length > 0 ? (
										<span>
											{t('general.selected', {
												count: table?.getSelectedRowModel().rows?.length,
											})}
										</span>
									) : (
										<span>{t('general.actions')}</span>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									onClick={() => {
										// removeMultipleMembersFromOrganization({
										// 	userIds: selectedRows?.map((row) => row.original.member._id) ?? [],
										// 	onSuccess: () => {
										// 		notify({
										// 			title: 'Invitations deleted',
										// 			description: 'The invitations were successfully deleted',
										// 			type: 'success',
										// 		});
										// 	},
										// 	onError: ({ error, details }) => {
										// 		notify({
										// 			title: error,
										// 			description: details,
										// 			type: 'error',
										// 		});
										// 	},
										// });
									}}
								>
									<Trash size={16} className='members-filter-icon' />
									<span>{t('general.delete_all')}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline'>
								<Funnel size={16} weight='fill' className='members-filter-icon' />
								{selectedRoles.length > 0 ? `${selectedRoles.length} selected` : 'Filter'}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{appRoles.map((role) => (
								<DropdownMenuCheckboxItem
									key={role}
									checked={selectedRoles.includes(role)}
									onCheckedChange={(checked) => {
										if (checked) {
											setSelectedRoles([...selectedRoles, role]);
											table?.getColumn('role')?.setFilterValue([...selectedRoles, role]);
										} else {
											setSelectedRoles(selectedRoles.filter((r) => r !== role));
											table
												?.getColumn('role')
												?.setFilterValue(selectedRoles.filter((r) => r !== role));
										}
									}}
								>
									{role}
								</DropdownMenuCheckboxItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button variant='primary'>{t('application.edit.invite')}</Button>
				</div>
			</div>
			<DataTable columns={AppMembersTableColumns} data={applicationTeam} setTable={setTable} />
		</div>
	);
}
