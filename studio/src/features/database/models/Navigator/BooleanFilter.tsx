import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { BOOLEAN_FILTERS, CellTypeMap } from '@/constants';
import useModelStore from '@/store/database/modelStore';
import useUtilsStore from '@/store/version/utilsStore';
import { ColumnFilterType, ConditionsType, FilterProps, Filters } from '@/types';
import { useMemo } from 'react';

export default function BooleanFilter({ type, columnName }: FilterProps) {
	const { setColumnFilters, columnFilters } = useUtilsStore();
	const filterType = CellTypeMap[type] as Filters;
	const model = useModelStore((state) => state.model);
	const selectedFilter = useMemo(
		() => columnFilters?.[model._id]?.[columnName] as ColumnFilterType,
		[columnFilters, columnName],
	);
	function onFilterChange(filter: string) {
		setColumnFilters(columnName, {
			filterType,
			conditions: [
				{
					type: ConditionsType.Equals,
					filter,
				},
			],
		});
	}

	return (
		<Select onValueChange={onFilterChange}>
			<SelectTrigger className='w-[170px] text-xs'>
				<SelectValue placeholder='Choose One'>
					{BOOLEAN_FILTERS.find((f) => f.value === selectedFilter?.conditions[0]?.type)?.label}
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
	);
}
