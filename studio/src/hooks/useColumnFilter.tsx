import { CellTypeMap } from '@/constants';
import useModelStore from '@/store/database/modelStore';
import useUtilsStore from '@/store/version/utilsStore';
import { ColumnFilterType, FieldTypes, Filters } from '@/types';
import { useMemo } from 'react';

export default function useColumnFilter(columnName: string, type: FieldTypes) {
	const model = useModelStore((state) => state.model);
	const columnFilters = useUtilsStore((state) => state.columnFilters);
	const setColumnFilters = useUtilsStore((state) => state.setColumnFilters);

	const filterType = CellTypeMap[type] as Filters;
	const selectedFilter = useMemo(
		() => columnFilters?.[model._id]?.[columnName] as ColumnFilterType,
		[columnFilters?.[model._id]?.[columnName], columnName],
	);

	function applyFilter(filter: ColumnFilterType) {
		setColumnFilters(columnName, filter);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}

	return {
		selectedFilter,
		filterType,
		applyFilter,
	};
}
