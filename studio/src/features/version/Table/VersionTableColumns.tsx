import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Version as VersionIcon } from '@/components/icons';
import { Version } from '@/types';
import { LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

export const VersionTableColumns: ColumnDef<Version>[] = [
	{
		id: 'name',
		header: 'Name',
		accessorKey: 'name',
		size: 75,
		cell: ({ row }) => {
			const { name } = row.original;
			return (
				<div className='flex items-center gap-1'>
					<VersionIcon className='w-5 h-5 text-subtle mr-2' />
					<span>{name}</span>
				</div>
			);
		},
	},
	{
		id: 'createdBy',
		header: 'Created By',
		accessorKey: 'createdBy',
		size: 200,
		cell: ({ row }) => {
			const { createdBy } = row.original;
			return (
				<div className='flex items-center gap-3'>
					<Avatar size='sm'>
						<AvatarImage src={createdBy?.pictureUrl as string} />
						<AvatarFallback name={createdBy?.name} color={createdBy?.color} />
					</Avatar>
					<div className='flex flex-col'>
						<span className='font-sfCompact text-sm'>{createdBy?.name}</span>
						<span className='font-sfCompact text-xs text-subtle'>{createdBy?.contactEmail}</span>
					</div>
				</div>
			);
		},
	},
	{
		id: 'permissions',
		header: 'Read/Write',
		accessorKey: 'readOnly',
		size: 100,
		cell: ({ row }) => {
			const { readOnly } = row.original;
			return (
				<div className='flex items-center gap-3'>
					{readOnly ? (
						<LockSimple size={20} className='text-elements-red' />
					) : (
						<LockSimpleOpen size={20} className='text-elements-green' />
					)}
					<span className='font-sfCompact text-sm'>{readOnly ? 'Read Only' : 'Read/Write'}</span>
				</div>
			);
		},
	},
	{
		id: 'actions',
		header: 'Actions',
		size: 75,
		cell: ({ row }) => {
			const { _id } = row.original;
			const app = useOrganizationStore.getState().application;
			const { closeVersionDrawer, selectApplication } = useOrganizationStore.getState();

			const onSelect = () => {
				if (!app) return;
				selectApplication(app);
				closeVersionDrawer();
			};

			return (
				<div className='flex items-center gap-3'>
					<Link
						onClick={onSelect}
						to={`/organization/${app?.orgId}/apps/${app?._id}/version/${_id}`}
					>
						<Button size='sm' variant='secondary'>
							Open
						</Button>
					</Link>
				</div>
			);
		},
	},
];
