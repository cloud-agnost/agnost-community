import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import {
	CellMaskMap,
	CellTypeMap,
	DATE_FILTERS,
	MONGODB_FILTERS,
	NUMBER_FILTERS,
	TEXT_FILTERS,
} from '@/constants';
import { useDebounce, useUpdateEffect } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import { ConditionsType, FilterProps, Filters, ResourceInstances } from '@/types';
import { useMask } from '@react-input/mask';
import React, { useMemo, useState } from 'react';

export default function ColumnFilter({
	onFilterChange,
	onConditionChange,
	type,
	selectedCondition,
	filterValue,
}: FilterProps & {
	onFilterChange: (filter: any) => void;
	onConditionChange: (condition: ConditionsType) => void;
	selectedCondition: ConditionsType;
	filterValue: string | number | null;
}) {
	const [search, setSearch] = useState(filterValue || '');
	const searchTerm = useDebounce(search as string, 500);

	const filterType = useMemo(() => CellTypeMap[type], [type]);
	const maskOptions = CellMaskMap[type];
	const mask = useMask(maskOptions);

	const database = useDatabaseStore((state) => state.database);
	const filters = useMemo(() => {
		// push mongo filters if db type is mongo
		let filters = [];

		if (filterType === Filters.Date) filters = DATE_FILTERS;
		else if (filterType === Filters.Number) filters = NUMBER_FILTERS;
		else filters = TEXT_FILTERS;

		if (database.type === ResourceInstances.MongoDB) {
			filters = filters.concat(MONGODB_FILTERS);
		}

		return filters;
	}, [filterType, database.type]);

	const inputProps = useMemo(() => {
		if (filterType === Filters.Date) {
			return {
				ref: mask,
			};
		}
		return {};
	}, [filterType, type]);

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;
		if (filterType === Filters.Number) {
			if (value === '' || !isNaN(Number(value))) {
				setSearch(Number(value));
			}
		} else {
			setSearch(value);
		}
	}

	useUpdateEffect(() => {
		if (search && selectedCondition) {
			onFilterChange({
				filter: search,
				type: selectedCondition,
			});
		}
	}, [searchTerm]);

	useUpdateEffect(() => {
		setSearch(filterValue || '');
	}, [filterValue]);

	return (
		<>
			<Select
				onValueChange={onConditionChange}
				defaultValue={selectedCondition ?? ConditionsType.Equals}
			>
				<SelectTrigger className='w-full text-xs'>
					<SelectValue placeholder='Choose One'>
						{filters.find((filter) => filter.value === selectedCondition)?.label ||
							'Select Condition'}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{filters.map((filter) => (
						<SelectItem key={filter.value} value={filter.value}>
							{filter.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{![ConditionsType.IsEmpty, ConditionsType.IsNotEmpty].includes(selectedCondition) && (
				<Input
					{...inputProps}
					type={filterType === Filters.Number ? 'number' : 'text'}
					value={search}
					onChange={onChange}
					placeholder='Filter'
				/>
			)}
		</>
	);
}
