import { ActionsCell } from '@/components/ActionsCell';
import { QUEUE_ICON_MAP } from '@/constants';
import { TabLink } from '@/features/version/Tabs';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError, ColumnDefWithClassName, MessageQueue, TabTypes } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { QueryClient } from '@tanstack/react-query';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { InstanceType } from 'components/InstanceType';
import { notify } from '@/utils';
import { TableConfirmation } from '@/components/Table';

const { openEditModal, deleteQueue } = useMessageQueueStore.getState();
const queryClient = new QueryClient();
const canEditQueue = getVersionPermission('middleware.update');
const canDeleteQueue = getVersionPermission('middleware.delete');

async function deleteHandler(mq: MessageQueue) {
	queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteQueue,
			onError: (error: APIError) => {
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		})
		.execute({
			appId: mq.appId,
			orgId: mq.orgId,
			versionId: mq.versionId,
			queueId: mq._id,
		});
}
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
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		cell: ({ row }) => {
			const { name, _id } = row.original;
			return <TabLink name={name} path={`${_id}`} type={TabTypes.MessageQueue} />;
		},
	},
	{
		id: 'delay',
		header: ({ column }) => <SortButton text={translate('queue.delay')} column={column} />,
		accessorKey: 'delay',
		enableSorting: true,
		sortingFn: 'alphanumeric',
	},
	{
		id: 'instance',
		header: ({ column }) => <SortButton text={translate('general.instance')} column={column} />,
		accessorKey: 'iid',
		cell: ({
			row: {
				original: { iid },
			},
		}) => {
			const environment = useEnvironmentStore.getState().environment;
			const instance = environment?.mappings.find((mapping) => mapping.design.iid === iid)?.resource
				.instance;
			const Icon = QUEUE_ICON_MAP[instance as string];
			return <InstanceType iid={iid} Icon={Icon} />;
		},
	},
	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
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
				text={translate('general.updated_at')}
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
			return (
				<ActionsCell<MessageQueue>
					original={original}
					canEdit={canEditQueue}
					onEdit={() => openEditModal(original)}
				>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('queue.delete.title')}
						description={translate('queue.delete.message')}
						onConfirm={() => deleteHandler(original)}
						contentClassName='m-0'
						hasPermission={canDeleteQueue}
					/>
				</ActionsCell>
			);
		},
	},
];

export default MessageQueueColumns;
