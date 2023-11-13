import { ColumnDefWithClassName } from '@/types';
import {
	ColumnFiltersState,
	SortingState,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

export default function useTable<TData>({
	data,
	columns,
}: {
	columns: ColumnDefWithClassName<TData>[];
	data: TData[];
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const table = useReactTable({
		data,
		columns,
		columnResizeMode: 'onChange',
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		enableRowSelection(row) {
			const cell = row.getAllCells().find((item) => item.column.id === 'select');
			if (!cell) return false;

			const meta = cell.column.columnDef?.meta;
			if (!meta) return true;

			const { disabled } = cell.column.columnDef.meta as {
				disabled: {
					key: string;
					value: string;
				};
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return row.original[disabled?.key] !== disabled?.value;
		},
		state: {
			sorting,
			rowSelection,
			columnFilters,
		},
	});

	return table;
}
