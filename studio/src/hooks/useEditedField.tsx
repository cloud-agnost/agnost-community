import useNavigatorStore from '@/store/database/navigatorStore';
import { Field, FieldTypes } from '@/types';
import { Cell } from '@tanstack/react-table';
import { useMemo } from 'react';

const NOT_EDITABLE_FIELDS = [
	FieldTypes.CREATED_AT,
	FieldTypes.UPDATED_AT,
	FieldTypes.ID,
	FieldTypes.ENCRYPTED_TEXT,
	FieldTypes.BINARY,
];
export default function useEditedField(field: Field, cell: Cell<any, any>) {
	const { editedField } = useNavigatorStore();
	const isEditable = useMemo(
		() =>
			editedField === cell.id &&
			field.creator !== 'system' &&
			!field.immutable &&
			!NOT_EDITABLE_FIELDS.includes(field.type),
		[editedField],
	);

	return isEditable;
}
