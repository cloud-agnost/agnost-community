'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table';
import { cn } from '@/utils';
import {
	ColumnDef,
	SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	Row,
	ColumnFiltersState,
	getFilteredRowModel,
	Table as TableType,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onRowClick?: (row: TData) => void;
	setSelectedRows?: (table: Row<TData>[]) => void;
	setTable?: (table: TableType<TData>) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	setSelectedRows,
	setTable,
	onRowClick,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			rowSelection,
			columnFilters,
		},
	});

	useEffect(() => {
		if (table.getSelectedRowModel().rows.length > 0) {
			setSelectedRows?.(table.getSelectedRowModel().rows);
		} else {
			setSelectedRows?.([]);
		}
	}, [table.getSelectedRowModel().rows]);

	useEffect(() => {
		if (table) {
			setTable?.(table);
		}
	}, [table]);

	return (
		<Table>
			{columns.map((column) => column.header).filter(Boolean).length > 0 && (
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className='head'>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										className={cn(typeof header.column.columnDef.header !== 'string' && 'sortable')}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
			)}
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() && 'selected'}
							onClick={() => onRowClick?.(row.original)}
							className={cn(onRowClick && 'cursor-pointer', 'content')}
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell
									key={cell.id}
									style={{
										width: cell.column.columnDef.size,
									}}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={columns.length} className='h-24 text-center'>
							No results.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
