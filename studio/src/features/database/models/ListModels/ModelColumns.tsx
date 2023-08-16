import { ActionsCell } from '@/components/ActionsCell';
import useAuthStore from '@/store/auth/authStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { ColumnDefWithClassName, Model } from '@/types';
import { translate } from '@/utils';
import { Columns } from '@phosphor-icons/react';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { CopyButton } from 'components/CopyButton';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';
import { Link } from 'react-router-dom';
const ModelColumns: ColumnDefWithClassName<Model>[] = [
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
		cell: ({
			row: {
				original: { _id, name },
			},
		}) => {
			return (
				<Link
					to={`${_id}/fields`}
					className='flex items-center gap-2 justify-between hover:underline'
				>
					{name}
				</Link>
			);
		},
	},
	{
		id: 'iid',
		header: translate('general.id').toUpperCase(),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { iid },
			},
		}) => {
			return (
				<div className='flex items-center gap-2 justify-between'>
					<span className='whitespace-nowrap'>{iid}</span>
					<CopyButton text={iid} />
				</div>
			);
		},
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
			const isMe = useAuthStore.getState().user?._id === createdBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={createdAt}>{avatar}</DateText>;
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
			const isMe = useAuthStore.getState().user?._id === updatedBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={updatedAt}>{avatar}</DateText>;
		},
	},
	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			const { setModelToEdit, setIsOpenEditModelDialog, deleteModel } = useModelStore.getState();
			function openEditDrawer() {
				setModelToEdit(original);
				setIsOpenEditModelDialog(true);
			}

			async function deleteHandler() {
				await deleteModel({
					orgId: original.orgId,
					modelId: original._id,
					appId: original.appId,
					dbId: original.dbId,
					versionId: original.versionId,
				});
			}
			//TODO: add column permissions
			return (
				<div className='flex items-center justify-end'>
					<Button
						to={`${original._id}/fields`}
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Columns />
					</Button>
					<ActionsCell
						original={original}
						onEdit={openEditDrawer}
						canEditKey='model.update'
						type='version'
					>
						<TableConfirmation
							align='end'
							closeOnConfirm
							showAvatar={false}
							title={translate('database.models.delete.title')}
							description={translate('database.models.delete.description')}
							onConfirm={deleteHandler}
							contentClassName='m-0'
							authorizedKey='model.delete'
						/>
					</ActionsCell>
				</div>
			);
		},
	},
];

export default ModelColumns;
