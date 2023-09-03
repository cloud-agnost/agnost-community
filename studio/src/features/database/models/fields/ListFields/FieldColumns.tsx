import { ActionsCell } from '@/components/ActionsCell';
import { SubFields } from '@/features/database/models/fields/ListFields/index.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { ColumnDefWithClassName, Field } from '@/types';
import { toDisplayName, translate } from '@/utils';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Badge } from 'components/Badge';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';
import { FIELD_ICON_MAP } from '@/constants';
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
		header: ({ column }) => <SortButton text={translate('general.field')} column={column} />,
		cell({ row: { original } }) {
			if (['object-list', 'object'].includes(original.type)) {
				return <SubFields field={original} name={original.name} />;
			}

			return original.name;
		},
		accessorKey: 'name',
		enableSorting: true,
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'type',
		header: translate('general.type'),
		accessorKey: 'type',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		cell: ({
			row: {
				original: { type },
			},
		}) => {
			const mapper: Record<string, string> = {
				createdat: 'datetime',
				updatedat: 'datetime',
				parent: 'reference',
			};
			const Icon = FIELD_ICON_MAP[mapper[type] ?? type];
			return (
				<span className='whitespace-nowrap flex items-center gap-1'>
					{Icon && <Icon className='w-5 h-5' />}
					{toDisplayName(mapper[type] ?? type)}
				</span>
			);
		},
	},
	{
		id: 'unique',
		header: translate('general.unique'),
		accessorKey: 'unique',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
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
		header: translate('general.indexed'),
		accessorKey: 'indexed',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
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
		header: translate('general.required'),
		accessorKey: 'required',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
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
		header: translate('general.read-only'),
		accessorKey: 'immutable',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
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
		enableSorting: true,
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				column={column}
			/>
		),
		accessorKey: 'created_at',
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
				<ActionsCell
					original={original}
					canEditKey='model.update'
					onEdit={openEditDrawer}
					type='version'
				>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('database.fields.delete.title')}
						description={translate('database.fields.delete.description')}
						onConfirm={deleteHandler}
						contentClassName='m-0'
						authorizedKey='model.delete'
					/>
				</ActionsCell>
			);
		},
	},
];

export default FieldColumns;
