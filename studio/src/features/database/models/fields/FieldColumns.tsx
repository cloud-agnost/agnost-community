import { ActionsCell } from '@/components/ActionsCell';
import { FIELD_ICON_MAP } from '@/constants';
import { SubFields } from '@/features/database/models/fields';
import useModelStore from '@/store/database/modelStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { ColumnDefWithClassName, Field } from '@/types';
import { getVersionPermission, toDisplayName, translate } from '@/utils';
import { Badge } from 'components/Badge';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

const { openEditFieldDialog, deleteField, model } = useModelStore.getState();
const canDelete = getVersionPermission('model.delete');
const canEdit = getVersionPermission('model.update');
async function deleteHandler(field: Field) {
	await deleteField({
		dbId: model.dbId,
		appId: model.appId,
		orgId: model.orgId,
		modelId: model._id,
		fieldId: field._id,
		versionId: model.versionId,
	});
}
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
		header: ({ column }) => <SortButton text={translate('general.type')} column={column} />,
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
		header: ({ column }) => <SortButton text={translate('general.unique')} column={column} />,

		accessorKey: 'unique',
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
		header: ({ column }) => <SortButton text={translate('general.indexed')} column={column} />,
		accessorKey: 'indexed',
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
		header: ({ column }) => <SortButton text={translate('general.required')} column={column} />,
		accessorKey: 'required',
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
		header: ({ column }) => <SortButton text={translate('general.read-only')} column={column} />,
		accessorKey: 'immutable',
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
			if (original.creator === 'system') return null;

			return (
				<ActionsCell
					original={original}
					canEdit={canEdit}
					onEdit={() => openEditFieldDialog(original)}
				>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('database.fields.delete.title')}
						description={translate('database.fields.delete.description')}
						onConfirm={() => deleteHandler(original)}
						contentClassName='m-0'
						hasPermission={canDelete}
					/>
				</ActionsCell>
			);
		},
	},
];

export default FieldColumns;
