import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/Table';
import { cn, translate } from '@/utils';
import {
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
import { ReactNode, useEffect, useState } from 'react';
import { ColumnDefWithClassName } from '@/types';

interface DataTableProps<TData> {
	columns: ColumnDefWithClassName<TData>[];
	data: TData[];
	onRowClick?: (row: TData) => void;
	setSelectedRows?: (table: Row<TData>[]) => void;
	setTable?: (table: TableType<TData>) => void;
	noDataMessage?: string | ReactNode;
}

export function DataTable<TData>({
	columns,
	data,
	setSelectedRows,
	setTable,
	onRowClick,
	noDataMessage = translate('general.no_results'),
}: DataTableProps<TData>) {
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
							{headerGroup.headers.map((header, index) => {
								return (
									<TableHead
										key={header.id}
										className={cn(
											header.column.columnDef.enableSorting && 'sortable',
											columns[index].className,
										)}
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
							{row.getVisibleCells().map((cell, index) => (
								<TableCell
									key={cell.id}
									className={cn('font-sfCompact', columns[index].className)}
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
					<TableRow className='border-none'>
						<TableCell colSpan={columns.length} className='h-24 text-center'>
							{noDataMessage}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
