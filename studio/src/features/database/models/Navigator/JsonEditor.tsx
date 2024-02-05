import { CodeEditor } from '@/components/CodeEditor';
import { CustomCellEditorProps } from 'ag-grid-react';
import { useEffect } from 'react';

const KEY_BACKSPACE = 'Backspace';

export default function JsonEditor({
	value,
	onValueChange,
	eventKey,
	node,
	column,
}: CustomCellEditorProps) {
	const updateValue = (value: string | undefined) => {
		onValueChange(value === '' ? null : value);
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
	}, []);

	useEffect(() => {
		onValueChange(JSON.stringify(value, null, 2));
	}, []);
	return (
		<div className='w-[500px] h-[210px] bg-subtle p-1 rounded'>
			<CodeEditor
				value={value}
				onChange={updateValue}
				defaultLanguage='json'
				name={`navigator-${column.getId()}-${node.rowIndex}`}
				className='w-full h-full'
				containerClassName='w-full h-full'
				options={{
					fontSize: 12,
				}}
			/>
		</div>
	);
}
