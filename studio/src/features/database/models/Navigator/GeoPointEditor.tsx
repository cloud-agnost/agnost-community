import { Input } from '@/components/Input';
import useDatabaseStore from '@/store/database/databaseStore';
import { CustomCellEditorProps } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';

const KEY_BACKSPACE = 'Backspace';
export default function GeoPointEditor({ value, onValueChange, eventKey }: CustomCellEditorProps) {
	const database = useDatabaseStore((state) => state.database);
	const ltdRef = useRef<HTMLInputElement>(null);
	const lngRef = useRef<HTMLInputElement>(null);
	const [coords, setCoords] = useState({
		lat: database.type === 'MongoDB' ? value?.coordinates?.[0] : value?.x,
		lng: database.type === 'MongoDB' ? value?.coordinates?.[1] : value?.y,
	});

	function onChange(lat: string, lng: string) {
		const newCoords = {
			lat: parseFloat(lat),
			lng: parseFloat(lng),
		};
		setCoords(newCoords);
		let newValue = {};
		if (database.type === 'MongoDB') {
			newValue = {
				coordinates: [newCoords.lng, newCoords.lat],
				type: 'Point',
			};
		} else {
			newValue = {
				x: newCoords.lat,
				y: newCoords.lng,
			};
		}

		onValueChange(newValue);
	}

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

		onChange(startValue.x, startValue.y);
	}, []);
	return (
		<div className='flex gap-4'>
			<Input
				ref={ltdRef}
				className='bg-subtle'
				type='number'
				id='latitude'
				value={coords.lat}
				onChange={(e) => onChange(e.target.value, lngRef?.current?.value as string)}
			/>
			{'-'}
			<Input
				ref={lngRef}
				className='bg-subtle'
				type='number'
				id='longitude'
				value={coords.lng}
				onChange={(e) => onChange(ltdRef?.current?.value as string, e.target.value)}
			/>
		</div>
	);
}
