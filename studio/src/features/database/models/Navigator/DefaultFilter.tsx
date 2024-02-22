import { useColumnFilter, useUpdateEffect } from '@/hooks';
import useUtilsStore from '@/store/version/utilsStore';
import { Condition, ConditionsType, FilterProps, Operators } from '@/types';
import { useState } from 'react';
import ColumnFilter from './ColumnFilter';
import OperatorSelect from './OperatorSelect';

export default function DefaultFilter({ type, columnName }: FilterProps) {
	const { setColumnFilters } = useUtilsStore();
	const { selectedFilter, filterType } = useColumnFilter(columnName, type);

	const [selectedType, setSelectedType] = useState(
		selectedFilter?.conditions[0]?.type ?? ConditionsType.Contains,
	);

	const [selectedType2, setSelectedType2] = useState(
		selectedFilter?.conditions[1]?.type ?? ConditionsType.Contains,
	);
	const updateFilterCondition = (conditionIndex: number, updates: Partial<Condition>) => {
		const initialConditions = selectedFilter?.conditions || [];
		let conditions;
		if (conditionIndex >= initialConditions.length) {
			conditions = new Array(conditionIndex + 1).fill({}).map((val, index) => {
				return index === conditionIndex ? { ...val, ...updates } : initialConditions[index] || {};
			});
		} else {
			conditions = initialConditions.map((condition, index) => {
				if (index === conditionIndex) {
					return { ...condition, ...updates };
				}
				return condition;
			});
		}

		setColumnFilters(columnName, {
			...selectedFilter,
			filterType,
			conditions,
		});
	};

	useUpdateEffect(() => {
		if (selectedFilter?.conditions[0]?.filter) {
			updateFilterCondition(0, { type: selectedType });
		}
	}, [selectedType]);

	useUpdateEffect(() => {
		if (selectedFilter?.conditions[1]?.filter) {
			updateFilterCondition(1, { type: selectedType2 });
		}
	}, [selectedType2]);

	return (
		<div className='space-y-4'>
			<ColumnFilter
				onFilterChange={(filter) => updateFilterCondition(0, filter)}
				type={type}
				columnName={columnName}
				selectedCondition={selectedType ?? ConditionsType.Contains}
				filterValue={(selectedFilter?.conditions[0]?.filter as string) ?? ''}
				onConditionChange={setSelectedType}
			/>
			{(selectedFilter?.conditions[0]?.filter || selectedFilter?.conditions[1]?.filter) && (
				<>
					<OperatorSelect
						defaultValue={selectedFilter?.operator ?? Operators.None}
						columnName={columnName}
						type={type}
					/>
					<ColumnFilter
						onFilterChange={(filter) => updateFilterCondition(1, filter)}
						type={type}
						columnName={columnName}
						selectedCondition={selectedType2 ?? ConditionsType.Contains}
						filterValue={(selectedFilter?.conditions[1]?.filter as string) ?? ''}
						onConditionChange={setSelectedType2}
					/>
				</>
			)}
		</div>
	);
}
