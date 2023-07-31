import { ColumnDefWithClassName, Field } from '@/types';
import { SortButton } from 'components/DataTable';
import { translate } from '@/utils';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { CopyButton } from 'components/CopyButton';
import { Trash } from '@phosphor-icons/react';
import useAuthStore from '@/store/auth/authStore.ts';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { DateText } from 'components/DateText';
import { Badge } from 'components/Badge';
import useModelStore from '@/store/database/modelStore.ts';
import { TableConfirmation } from 'components/Table';
import { Checkbox } from 'components/Checkbox';

const FieldColumns: ColumnDefWithClassName<Field>[] = [
	{
		id: 'select',
		className: '!max-w-[40px] !w-[40px]',
		header: (props) => {
			return (
				<Checkbox
					checked={props.table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => props.table.toggleAllPageRowsSelected(!!value)}
					aria-label='Select all'
				/>
			);
		},
		cell: (props) => {
			const isSystem = props.row.original.creator === 'system';
			return (
				<Checkbox
					disabled={isSystem}
					checked={props.row.original.creator !== 'system' && props.row.getIsSelected()}
					onCheckedChange={(value) => props.row.toggleSelected(!!value)}
					aria-label='Select row'
				/>
			);
		},
		meta: {
			disabled: {
				key: 'creator',
				value: 'system',
			},
		},
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.field').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
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
		id: 'unique',
		header: translate('general.unique').toUpperCase(),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { unique },
			},
		}) => {
			return (
				<Badge
					rounded
					variant={unique ? 'green' : 'red'}
					text={unique ? translate('general.yes') : translate('general.no')}
				/>
			);
		},
	},
	{
		id: 'indexed',
		header: translate('general.indexed').toUpperCase(),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { indexed },
			},
		}) => {
			return (
				<Badge
					rounded
					variant={indexed ? 'green' : 'red'}
					text={indexed ? translate('general.yes') : translate('general.no')}
				/>
			);
		},
	},
	{
		id: 'required',
		header: translate('general.required').toUpperCase(),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { required },
			},
		}) => {
			return (
				<Badge
					rounded
					variant={required ? 'green' : 'red'}
					text={required ? translate('general.yes') : translate('general.no')}
				/>
			);
		},
	},
	{
		id: 'immutable',
		className: 'whitespace-nowrap',
		header: translate('general.read-only').toUpperCase(),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { immutable },
			},
		}) => {
			return (
				<Badge
					rounded
					variant={immutable ? 'green' : 'red'}
					text={immutable ? translate('general.yes') : translate('general.no')}
				/>
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
			const { setFieldToEdit, setIsOpenEditFieldDialog, deleteField, models } =
				useModelStore.getState();

			function openEditDrawer() {
				setFieldToEdit(original);
				setIsOpenEditFieldDialog(true);
			}

			async function deleteHandler() {
				const model = models.find((model) =>
					model.fields.find((field) => field._id === original._id),
				);
				if (!model) return;

				await deleteField({
					dbId: model.dbId,
					appId: model.appId,
					orgId: model.orgId,
					modelId: model._id,
					fieldId: original._id,
					versionId: model.versionId,
				});
			}

			if (original.creator === 'system') return null;

			return (
				<div className='flex items-center justify-end'>
					<Button
						onClick={openEditDrawer}
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Pencil />
					</Button>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('database.fields.delete.title')}
						description={translate('database.fields.delete.description')}
						onConfirm={deleteHandler}
						contentClassName='m-0'
					>
						<Button
							variant='blank'
							rounded
							className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
							iconOnly
						>
							<Trash size={20} />
						</Button>
					</TableConfirmation>
				</div>
			);
		},
	},
];

export default FieldColumns;
