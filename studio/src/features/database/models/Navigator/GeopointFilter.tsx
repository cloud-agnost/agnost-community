import { useColumnFilter, useUpdateEffect } from '@/hooks';
import useUtilsStore from '@/store/version/utilsStore';
import { ConditionsType, FilterProps, Operators } from '@/types';
import GeopointFilterItem from './GeopointFilterItem';
import OperatorSelect from './OperatorSelect';
import { useState } from 'react';

export default function GeopointFilter({ columnName, type }: FilterProps) {
	const { setColumnFilters } = useUtilsStore();
	const { selectedFilter, filterType } = useColumnFilter(columnName, type);

	const [selectedType, setSelectedType] = useState(
		selectedFilter?.conditions[0]?.type ?? ConditionsType.DistanceGreaterThan,
	);

	const [selectedType2, setSelectedType2] = useState(
		selectedFilter?.conditions[1]?.type ?? ConditionsType.DistanceGreaterThan,
	);

	const updateFilterConditions = (index: number, updates: any) => {
		const newConditions = [...(selectedFilter?.conditions || [])];
		newConditions[index] = {
			...newConditions[index],
			...updates,
		};

		setColumnFilters(columnName, {
			...selectedFilter,
			filterType,
			conditions: newConditions,
		});
	};

	useUpdateEffect(() => {
		if (selectedFilter?.conditions[0]?.filter && selectedFilter?.conditions[0]?.filterFrom) {
			updateFilterConditions(0, { type: selectedType });
		}
	}, [selectedType]);

	useUpdateEffect(() => {
		if (selectedFilter?.conditions[1]?.filter && selectedFilter?.conditions[1]?.filterFrom) {
			updateFilterConditions(1, { type: selectedType2 });
		}
	}, [selectedType2]);

	return (
		<div className='space-y-6'>
			<GeopointFilterItem
				onUpdates={(updates) => updateFilterConditions(0, updates)}
				condition={selectedFilter?.conditions[0]}
				conditionType={selectedType}
				onConditionChange={(condition) => setSelectedType(condition)}
			/>
			{(selectedFilter?.conditions[0]?.filter || selectedFilter?.conditions[1]?.filter) && (
				<>
					<OperatorSelect
						defaultValue={selectedFilter?.operator ?? Operators.None}
						columnName={columnName}
						type={type}
					/>
					<GeopointFilterItem
						onUpdates={(updates) => updateFilterConditions(1, updates)}
						condition={selectedFilter?.conditions[1]}
						conditionType={selectedType2}
						onConditionChange={(condition) => setSelectedType2(condition)}
					/>
				</>
			)}
		</div>
	);
}
