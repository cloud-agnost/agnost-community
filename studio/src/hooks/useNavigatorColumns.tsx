import { SortButton } from '@/components/DataTable';
import {
	BasicValueList,
	BooleanField,
	DateTime,
	Enum,
	GeoPoint,
	Link,
	NavigatorColumns,
	Number,
	Reference,
	SubObject,
	Text,
	Time,
} from '@/features/database/models/Navigator';
import Json from '@/features/database/models/Navigator/Json';
import useNavigatorStore from '@/store/database/navigatorStore';
import { ColumnDefWithClassName, Field, FieldTypes } from '@/types';
import { cn, getValueFromData } from '@/utils';
import { ElementType, useEffect, useState } from 'react';

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
	time: Time,
	binary: Text,
};
export default function useNavigatorColumns(fields: Field[]) {
	const [columns, setColumns] = useState(NavigatorColumns);
	useEffect(() => {
		const newNavigatorColumns: ColumnDefWithClassName<Record<string, any>>[] = fields?.map(
			(field) => ({
				id: field._id,
				header: () => <SortButton text={field.name} field={field.name} />,
				accessorKey: field.type === FieldTypes.ID ? 'id' : field.name,
				size: field.type === FieldTypes.ID ? 50 : 200,
				className: cn(field.type === FieldTypes.ID && 'sticky left-0 z-10'),
				meta: {
					type: field.type,
				},

				cell: ({ row, cell }) => {
					const NavigatorComponent = NavigatorComponentMap[field.type];
					return (
						<NavigatorComponent
							cell={cell}
							row={row}
							id={row.original.id}
							index={row.index}
							field={field}
							value={getValueFromData(
								row.original,
								field.type === FieldTypes.ID ? 'id' : field.name,
							)}
							parentId={useNavigatorStore.getState().data[cell.row.index].id}
						/>
					);
				},
			}),
		);
		setColumns([NavigatorColumns[0], ...newNavigatorColumns, NavigatorColumns[1]]);
	}, [fields]);
	return columns;
}
