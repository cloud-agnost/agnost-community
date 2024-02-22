import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { GeoPointFilterTypes } from '@/constants';
import { useUpdateEffect } from '@/hooks';
import { Condition, ConditionsType } from '@/types';
import { useState } from 'react';

interface GeopointFilterItemProps {
	onUpdates: (updates: Condition) => void;
	condition?: Condition;
	conditionType?: ConditionsType;
	onConditionChange?: (condition: ConditionsType) => void;
}

export default function GeopointFilterItem({
	onUpdates,
	condition,
	conditionType,
	onConditionChange,
}: GeopointFilterItemProps) {
	const [longitude, setLongitude] = useState((condition?.filter as number[])?.[0] ?? null);
	const [latitude, setLatitude] = useState((condition?.filter as number[])?.[1] ?? null);
	const [distance, setDistance] = useState(condition?.filterFrom ?? '');

	useUpdateEffect(() => {
		if (longitude && latitude && distance) {
			onUpdates({
				filter: [longitude, latitude],
				filterFrom: distance,
				type: conditionType,
			});
		}
	}, [longitude, latitude, distance]);

	useUpdateEffect(() => {
		setLongitude((condition?.filter as number[])?.[0] ?? null);
		setLatitude((condition?.filter as number[])?.[1] ?? null);
		setDistance(condition?.filterFrom ?? '');
	}, [condition]);

	function onChange(value: string, cb: (value: number) => void) {
		const number = Number(value);
		if (!isNaN(number)) {
			cb(number);
		}
	}

	return (
		<div className='space-y-4'>
			<Select
				onValueChange={onConditionChange}
				defaultValue={conditionType ?? ConditionsType.DistanceGreaterThan}
			>
				<SelectTrigger className='w-full text-xs'>
					<SelectValue placeholder='Choose One'>
						{GeoPointFilterTypes.find((filter) => filter.value === conditionType)?.label ||
							'Select Condition'}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{GeoPointFilterTypes.map((filter) => (
						<SelectItem key={filter.value} value={filter.value}>
							{filter.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<Input
				type='number'
				placeholder='Longitude'
				value={longitude}
				onChange={(e) => onChange(e.target.value, setLongitude)}
			/>
			<Input
				type='number'
				placeholder='Latitude'
				value={latitude}
				onChange={(e) => onChange(e.target.value, setLatitude)}
			/>
			<Input
				type='number'
				placeholder='Distance (km)'
				value={distance}
				onChange={(e) => onChange(e.target.value, setDistance)}
			/>
		</div>
	);
}
