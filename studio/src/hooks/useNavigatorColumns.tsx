import { NavigatorCellEditorMap, CellRendererMap, CellMaskMap, CellTypeMap } from '@/constants';
import { NavigatorColumns } from '@/features/database/models/Navigator';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import { Field, FieldTypes } from '@/types';
import { DATE_FORMAT, DATE_TIME_FORMAT, formatDate, getValueFromData } from '@/utils';
import { ColDef, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import _ from 'lodash';
import { useMemo } from 'react';

export default function useNavigatorColumns() {
	const database = useDatabaseStore((state) => state.database);
	const { model, subModel } = useModelStore();
	const hasSubModel = !_.isEmpty(subModel);
	const fields = hasSubModel ? subModel?.fields : model?.fields;
	function valueFormatter({ value }: ValueFormatterParams, field: Field) {
		if (field.type === FieldTypes.DECIMAL) {
			return Number(value);
		}

		if (field.type === FieldTypes.JSON) {
			return JSON.stringify(value, null, 2);
		}

		if ([FieldTypes.DATETIME, FieldTypes.CREATED_AT, FieldTypes.UPDATED_AT].includes(field.type)) {
			return formatDate(value, DATE_TIME_FORMAT);
		}
		if (field.type === FieldTypes.DATE) return formatDate(value, DATE_FORMAT);

		if (FieldTypes.GEO_POINT === field.type) {
			return `${database.type === 'MongoDB' ? value?.coordinates?.[0] : value?.x} - ${
				database.type === 'MongoDB' ? value?.coordinates?.[1] : value?.y
			}`;
		}

		if (field.type === FieldTypes.ENCRYPTED_TEXT) {
			return value.split('').fill('*').join('');
		}

		return value;
	}

	return useMemo(() => {
		if (!fields) return NavigatorColumns;
		const newNavigatorColumns: ColDef[] = fields?.map((field) => ({
			field: field.type === FieldTypes.ID ? 'id' : field.name,
			pinned: field.name === 'id' ? 'left' : undefined,
			valueGetter: (params: ValueGetterParams) => {
				return getValueFromData(params.data, field.type === FieldTypes.ID ? 'id' : field.name);
			},
			editable:
				field.creator !== 'system' &&
				field.type !== FieldTypes.ENCRYPTED_TEXT &&
				field.type !== FieldTypes.BINARY &&
				field.type !== FieldTypes.OBJECT &&
				field.type !== FieldTypes.OBJECT_LIST &&
				!field.immutable,
			filter: true,
			headerComponentParams: { text: field.name, field: field.name },
			maxWidth: field.type === FieldTypes.ID ? 75 : undefined,
			cellEditor: NavigatorCellEditorMap[field.type],
			cellRenderer: CellRendererMap[field.type],
			cellEditorPopup: field.type === FieldTypes.RICH_TEXT || field.type === FieldTypes.JSON,

			cellEditorParams: {
				mask: CellMaskMap[field.type]?.mask,
				replacement: CellMaskMap[field.type]?.replacement,
				type: field.type,
				decimalPlaces: field.decimal?.decimalDigits,
				values: field.enum?.selectList,
			},
			cellRendererParams: { type: field.type, referenceModelIid: field.reference?.iid },
			cellDataType: CellTypeMap[field.type],
			valueFormatter: (params) => valueFormatter(params, field),
		}));
		return [NavigatorColumns[0], ...newNavigatorColumns, NavigatorColumns[1]];
	}, [fields]);
}
