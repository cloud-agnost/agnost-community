import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { TableConfirmation } from '@/components/Table';
import { BADGE_COLOR_MAP } from '@/constants';
import useOrganizationStore from '@/store/organization/organizationStore';
import useTaskStore from '@/store/task/taskStore';
import { APIError, ColumnDefWithClassName, TabTypes, Task } from '@/types';
import { describeCronExpression, getVersionPermission, notify, translate } from '@/utils';
import { QueryClient } from '@tanstack/react-query';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { Calendar } from 'components/icons';
import { TabLink } from '../version/Tabs';
import useEnvironmentStore from '@/store/environment/environmentStore';

const queryClient = new QueryClient();
const { openEditTaskModal, deleteTask } = useTaskStore.getState();
const { getEnvironmentResources } = useEnvironmentStore.getState();
async function deleteHandler(task: Task) {
	const environment = useEnvironmentStore.getState().environment;
	return queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteTask,
			onSuccess: () => {
				getEnvironmentResources({
					orgId: environment?.orgId,
					appId: environment?.appId,
					envId: environment?._id,
					versionId: environment?.versionId,
				});
			},
			onError: (error: APIError) => {
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		})
		.execute({
			appId: task.appId,
			orgId: task.orgId,
			versionId: task.versionId,
			taskId: task._id,
		});
}
const TaskColumns: ColumnDefWithClassName<Task>[] = [
	{
		id: 'select',
		enableResizing: false,
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
		header: () => <SortButton text={translate('general.name')} field='name' />,
		accessorKey: 'name',
		cell: ({ row }) => {
			const { name, _id } = row.original;
			return <TabLink name={name} path={`${_id}`} type={TabTypes.Task} />;
		},
	},
	{
		id: 'delay',
		header: translate('task.schedule'),
		accessorKey: 'cronExpression',
		enableSorting: true,
		size: 300,
		cell: ({ row }) => {
			const { cronExpression } = row.original;
			const result = describeCronExpression(cronExpression);
			return (
				<div className='grid grid-cols-[1fr,10fr] items-center gap-2'>
					<Calendar className='w-4 h-4' />
					{result}
				</div>
			);
		},
	},
	{
		id: 'logExecution',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('task.logExec')}
				field='logExecution'
			/>
		),
		accessorKey: 'logExecution',
		size: 200,
		cell: ({ row }) => {
			const { logExecution } = row.original;
			const logExecutionText = logExecution
				? translate('general.enabled')
				: translate('general.disabled');
			return (
				<Badge
					variant={BADGE_COLOR_MAP[logExecutionText.toUpperCase()]}
					text={logExecutionText}
					rounded
				/>
			);
		},
	},
	{
		id: 'createdAt',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				field='createdAt'
			/>
		),
		accessorKey: 'createdAt',
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
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at')}
				field='updatedAt'
			/>
		),
		accessorKey: 'updatedAt',
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
			const canEditTask = getVersionPermission('task.update');
			const canDeleteTask = getVersionPermission('task.delete');
			return (
				<ActionsCell<Task>
					onEdit={() => openEditTaskModal(original)}
					original={original}
					canEdit={canEditTask}
				>
					<TableConfirmation
						align='end'
						title={translate('task.delete.title')}
						description={translate('task.delete.message')}
						onConfirm={() => deleteHandler(original)}
						contentClassName='m-0'
						hasPermission={canDeleteTask}
					/>
				</ActionsCell>
			);
		},
	},
];

export default TaskColumns;
