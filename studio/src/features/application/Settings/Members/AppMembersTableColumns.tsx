import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { SortButton } from '@/components/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import useTypeStore from '@/store/types/typeStore';
import { ApplicationMember } from '@/types';
import { translate } from '@/utils';
import { Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';

const roles = useTypeStore.getState?.().appRoles;
export const AppMembersTableColumns: ColumnDef<ApplicationMember>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
		size: 45,
	},
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('application.table.name')} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		size: 600,
		cell: ({ row }) => {
			const { member } = row.original;
			return (
				<div className='flex items-center  gap-4'>
					<Avatar size='md'>
						<AvatarImage src={member.pictureUrl} />
						<AvatarFallback name={member.name} color={member.color} isUserAvatar />
					</Avatar>
					<div className='flex flex-col'>
						<span className='text-default text-sm font-sfCompact'>{member.name}</span>
						<span className='text-subtle text-xs font-sfCompact'>{member.contactEmail}</span>
					</div>
				</div>
			);
		},
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		filterFn: 'arrIncludesSome',
		cell: ({ row }) => {
			const { role, member } = row.original;
			return member.isAppOwner ? (
				<span className='text-default text-sm font-sfCompact'>{role}</span>
			) : (
				<Select
					defaultValue={role}
					onValueChange={(val) => {
						console.log(val);
					}}
				>
					<SelectTrigger className='w-[150px]'>
						<SelectValue>{role}</SelectValue>
					</SelectTrigger>

					<SelectContent>
						{roles.map((role) => (
							<SelectItem key={role} value={role}>
								{role}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			);
		},
	},
	{
		id: 'action',
		header: '',
		size: 100,
		cell: ({ row }) => {
			const { member } = row.original;
			// const { removeMember } = useApplicationStore.getState();
			return (
				member.isAppOwner && (
					<div className='flex items-center justify-end'>
						<Button
							variant='blank'
							iconOnly
							// onClick={() => removeMember(member._id)}
						>
							<Trash size={20} />
						</Button>
					</div>
				)
			);
		},
	},
];
