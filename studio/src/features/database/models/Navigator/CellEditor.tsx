import { FieldTypes } from '@/types';
import { DATE_FORMAT, DATE_TIME_FORMAT, formatDate } from '@/utils';
import { InputMask, Replacement } from '@react-input/mask';
import { CustomCellEditorProps } from 'ag-grid-react';
import { useEffect, useRef } from 'react';

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';

export interface CellEditorProps extends CustomCellEditorProps {
	mask: string;
	replacement: Replacement;
	type: FieldTypes;
}
export default function CellEditor({
	mask,
	value,
	onValueChange,
	eventKey,
	replacement,
	type,
}: CellEditorProps) {
	const updateValue = (val: string) => {
		onValueChange(val === '' ? null : val);
	};

	useEffect(() => {
		let startValue;

		if (eventKey === KEY_BACKSPACE) {
			startValue = '';
		} else if (eventKey && eventKey.length === 1) {
			startValue = eventKey;
		} else {
			startValue = value;
		}
		if (startValue == null) {
			startValue = '';
		}

		updateValue(startValue);

		refInput.current?.focus();
	}, []);

	const refInput = useRef<HTMLInputElement>(null);

	function convertValue(value: string) {
		if (!value) return '';
		if (type === FieldTypes.DATETIME) return formatDate(value, DATE_TIME_FORMAT);
		if (type === FieldTypes.DATE) return formatDate(value, DATE_FORMAT);
		return value;
	}

	useEffect(() => {
		onValueChange(convertValue(value));
	}, []);

	return (
		<InputMask
			mask={mask}
			replacement={replacement}
			separate
			value={value || ''}
			ref={refInput}
			onChange={(event) => updateValue(event.target.value)}
			className='w-full h-full bg-transparent border-none outline-none px-2'
		/>
	);
}
