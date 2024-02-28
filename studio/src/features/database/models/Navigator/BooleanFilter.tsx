import { Button } from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { BOOLEAN_FILTERS } from '@/constants';
import { useColumnFilter } from '@/hooks';
import { ConditionsType, FilterProps } from '@/types';
import { useEffect, useState } from 'react';

export default function BooleanFilter({ type, columnName }: FilterProps) {
	const { filterType, selectedFilter, applyFilter } = useColumnFilter(columnName, type);
	const [filter, setFilter] = useState(selectedFilter);

	const onFilterChange = (value: string) => {
		setFilter({
			filterType,
			conditions: [
				{
					type: ConditionsType.Equals,
					filter: value === 'true',
				},
			],
		});
	};

	useEffect(() => {
		setFilter(selectedFilter);
	}, [selectedFilter]);

	return (
		<>
			<Select onValueChange={onFilterChange}>
				<SelectTrigger className='w-full text-xs'>
					<SelectValue placeholder='Choose One'>
						{BOOLEAN_FILTERS.find((f) => f.value === filter?.conditions[0]?.type)?.label}
					</SelectValue>
				</SelectTrigger>

				<SelectContent>
					{BOOLEAN_FILTERS?.map((filter) => (
						<SelectItem key={filter.value} value={filter.value}>
							<p className='text-xs'>{filter.label}</p>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{filter?.conditions[0]?.filter ? (
				<Button variant='primary' onClick={() => applyFilter(filter)} size='full'>
					Apply
				</Button>
			) : null}
		</>
	);
}
