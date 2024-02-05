import {
	CellEditor,
	GeoPointEditor,
	JsonEditor,
	Link,
	Reference,
	SubObject,
} from '@/features/database/models/Navigator';

import { FieldTypes } from '@/types';
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT_WITH_SECONDS } from '@/utils';
import { Replacement } from '@react-input/mask';
import { ElementType } from 'react';

export const NavigatorCellEditorMap: Record<FieldTypes, string | ElementType> = {
	[FieldTypes.TEXT]: 'agTextCellEditor',
	[FieldTypes.BOOLEAN]: 'agCheckboxCellEditor',
	[FieldTypes.ENUM]: 'agSelectCellEditor',
	[FieldTypes.JSON]: JsonEditor,
	[FieldTypes.TIME]: CellEditor,
	[FieldTypes.DATE]: CellEditor,
	[FieldTypes.DATETIME]: CellEditor,
	[FieldTypes.LINK]: 'agTextCellEditor',
	[FieldTypes.REFERENCE]: 'reference',
	[FieldTypes.ID]: 'agTextCellEditor',
	[FieldTypes.RICH_TEXT]: 'agLargeTextCellEditor',
	[FieldTypes.ENCRYPTED_TEXT]: 'agTextCellEditor',
	[FieldTypes.EMAIL]: CellEditor,
	[FieldTypes.PHONE]: CellEditor,
	[FieldTypes.INTEGER]: 'agNumberCellEditor',
	[FieldTypes.DECIMAL]: 'agNumberCellEditor',
	[FieldTypes.CREATED_AT]: 'agDateStringCellEditor',
	[FieldTypes.UPDATED_AT]: 'agDateStringCellEditor',
	[FieldTypes.GEO_POINT]: GeoPointEditor,
	[FieldTypes.BINARY]: 'agLargeTextCellEditor',
	[FieldTypes.BASIC_VALUES_LIST]: 'agTextCellEditor',
	[FieldTypes.OBJECT]: 'agLargeTextCellEditor',
	[FieldTypes.OBJECT_LIST]: 'agLargeTextCellEditor',
};
export const CellTypeMap: Record<FieldTypes, string> = {
	[FieldTypes.TEXT]: 'text',
	[FieldTypes.BOOLEAN]: 'boolean',
	[FieldTypes.ENUM]: 'text',
	[FieldTypes.JSON]: 'object',
	[FieldTypes.TIME]: 'text',
	[FieldTypes.DATE]: 'dateString',
	[FieldTypes.DATETIME]: 'dateString',
	[FieldTypes.LINK]: 'text',
	[FieldTypes.REFERENCE]: 'text',
	[FieldTypes.ID]: 'text',
	[FieldTypes.RICH_TEXT]: 'text',
	[FieldTypes.ENCRYPTED_TEXT]: 'text',
	[FieldTypes.EMAIL]: 'text',
	[FieldTypes.PHONE]: 'text',
	[FieldTypes.INTEGER]: 'number',
	[FieldTypes.DECIMAL]: 'number',
	[FieldTypes.CREATED_AT]: 'dateString',
	[FieldTypes.UPDATED_AT]: 'dateString',
	[FieldTypes.GEO_POINT]: 'text',
	[FieldTypes.BINARY]: 'text',
	[FieldTypes.BASIC_VALUES_LIST]: 'text',
	[FieldTypes.OBJECT]: 'text',
	[FieldTypes.OBJECT_LIST]: 'text',
};

export const CellRendererMap: Record<string, ElementType> = {
	[FieldTypes.LINK]: Link,
	[FieldTypes.REFERENCE]: Reference,
	[FieldTypes.OBJECT]: SubObject,
	[FieldTypes.OBJECT_LIST]: SubObject,
};
export const CellMaskMap: Record<string, { mask: string; replacement: Replacement }> = {
	[FieldTypes.PHONE]: {
		mask: '+____________',
		replacement: { _: /\d/ },
	},
	[FieldTypes.TIME]: {
		mask: TIME_FORMAT_WITH_SECONDS,
		replacement: { h: /\d/, m: /\d/, s: /\d/ },
	},
	[FieldTypes.DATE]: {
		mask: DATE_FORMAT,
		replacement: { y: /\d/, M: /\d/, d: /\d/ },
	},
	[FieldTypes.DATETIME]: {
		mask: DATE_TIME_FORMAT,
		replacement: { y: /\d/, M: /\d/, d: /\d/, h: /\d/, m: /\d/, s: /\d/ },
	},
};
