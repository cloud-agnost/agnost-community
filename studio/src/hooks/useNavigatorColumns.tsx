import { ActionsCell } from '@/components/ActionsCell';
import { Checkbox } from '@/components/Checkbox';
import { SortButton } from '@/components/DataTable';
import { TableConfirmation } from '@/components/Table';
import {
	BasicValueList,
	BooleanField,
	DateTime,
	Enum,
	GeoPoint,
	Link,
	Number,
	Reference,
	SubObject,
	Text,
} from '@/features/database/models/Navigator';
import Json from '@/features/database/models/Navigator/Json';
import useNavigatorStore from '@/store/database/navigatorStore';
import { ColumnDefWithClassName, Field } from '@/types';
import { capitalize, cn, translate } from '@/utils';
import { ElementType } from 'react';
import { useAuthorizeVersion } from '.';

export default function useNavigatorColumns(fields: Field[]) {
	const { editedField, deleteDataFromModel } = useNavigatorStore();
	const canEditModel = useAuthorizeVersion('model.update');
	const canDeleteModel = useAuthorizeVersion('model.delete');
	const NavigatorComponentMap: Record<string, ElementType> = {
		text: Text,
		enum: Enum,
		integer: Number,
		decimal: Number,
		reference: Reference,
		boolean: BooleanField,
		createdat: DateTime,
		updatedat: DateTime,
		datetime: DateTime,
		link: Link,
		'basic-values-list': BasicValueList,
		'geo-point': GeoPoint,
		'object-list': SubObject,
		object: SubObject,
		json: Json,
		id: Text,
		'rich-text': Text,
		'encrypted-text': Text,
		email: Text,
		phone: Text,
		date: DateTime,
		time: DateTime,
		binary: Text,
	};
	const NavigatorColumns: ColumnDefWithClassName<Record<string, any>>[] = [
		{
			id: 'select',
			size: 50,
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
			id: 'actions',
			className: 'actions',
			size: 100,
			cell: ({ row: { original } }) => {
				function handleEdit() {
					// TODO: handle edit
				}

				async function deleteHandler() {
					await deleteDataFromModel({
						id: original.id,
					});
				}

				return (
					<ActionsCell<any> original={original} canEdit={canEditModel} onEdit={handleEdit}>
						<TableConfirmation
							align='end'
							closeOnConfirm
							showAvatar={false}
							title={translate('version.middleware.delete.title')}
							description={translate('version.middleware.delete.message')}
							onConfirm={deleteHandler}
							contentClassName='m-0'
							hasPermission={canDeleteModel}
						/>
					</ActionsCell>
				);
			},
		},
	];

	fields?.forEach((field, index) => {
		NavigatorColumns.splice(index + 1, 0, {
			id: field._id,
			header: ({ column }) => <SortButton text={capitalize(field.name)} column={column} />,
			accessorKey: field.name === '_id' ? 'id' : field.name,
			size: 200,
			className: cn(field.name === '_id' && 'sticky left-0 z-10'),
			meta: {
				type: field.type,
			},
			cell: ({ row, cell }) => {
				const NavigatorComponent = NavigatorComponentMap[field.type];
				return (
					<NavigatorComponent
						isEditable={editedField === cell.id && field.creator !== 'system' && !field.immutable}
						row={row}
						field={field}
						parentId={useNavigatorStore.getState().data[cell.row.index].id}
					/>
				);
			},
		});
	});

	return NavigatorColumns;
}
