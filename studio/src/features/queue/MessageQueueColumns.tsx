import useOrganizationStore from '@/store/organization/organizationStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { ColumnDefWithClassName, MessageQueue } from '@/types';
import { translate } from '@/utils';
import { Trash } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { CopyButton } from 'components/CopyButton';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { Pencil } from 'components/icons';

const MessageQueueColumns: ColumnDefWithClassName<MessageQueue>[] = [
	{
		id: 'select',
		className: '!max-w-[40px] !w-[40px]',
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
	},
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'iid',
		header: translate('general.id').toUpperCase(),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		className: '!max-w-[100px] !w-[100px]',
		cell: ({
			row: {
				original: { iid },
			},
		}) => {
			return (
				<div className='flex items-center justify-between group'>
					<span className='whitespace-nowrap'>{iid}</span>
					<CopyButton text={iid} className='hidden group-hover:block' />
				</div>
			);
		},
	},
	{
		id: 'delay',
		header: ({ column }) => (
			<SortButton text={translate('queue.delay').toUpperCase()} column={column} />
		),
		accessorKey: 'delay',
		enableSorting: true,
		sortingFn: 'alphanumeric',
	},

	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at').toUpperCase()}
				column={column}
			/>
		),
		accessorKey: 'created_at',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { createdAt, createdBy },
			},
		}) => {
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);

			return <DateText date={createdAt} user={user} />;
		},
	},

	{
		id: 'updatedAt',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at').toUpperCase()}
				column={column}
			/>
		),
		accessorKey: 'updatedAt',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt, updatedBy },
			},
		}) => {
			if (!updatedBy) return null;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === updatedBy);
			return updatedBy && <DateText date={updatedAt} user={user} />;
		},
	},
	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			const { openDeleteModal } = useMessageQueueStore.getState();
			return (
				<div className='flex items-center justify-end'>
					<Button
						to={`${original._id}`}
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Pencil />
					</Button>
					<Button
						variant='blank'
						rounded
						className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
						iconOnly
						onClick={() => openDeleteModal(original)}
					>
						<Trash size={20} />
					</Button>
				</div>
			);
		},
	},
];

export default MessageQueueColumns;
