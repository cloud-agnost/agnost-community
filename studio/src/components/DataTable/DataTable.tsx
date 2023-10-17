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
	Cell,
} from '@tanstack/react-table';
import { ReactNode, useEffect, useState } from 'react';
import { ColumnDefWithClassName } from '@/types';
import './sortButton.scss';
interface DataTableProps<TData> {
	columns: ColumnDefWithClassName<TData>[];
	data: TData[];
	className?: string;
	containerClassName?: string;
	onRowClick?: (row: TData) => void;
	onCellClick?: (cell: Cell<TData, any>) => void;
	setSelectedRows?: (table: Row<TData>[]) => void;
	setTable?: (table: TableType<TData>) => void;
	noDataMessage?: string | ReactNode;
	headerClassName?: string;
}

export function DataTable<TData>({
	columns,
	data,
	setSelectedRows,
	setTable,
	onRowClick,
	onCellClick,
	noDataMessage = translate('general.no_results'),
	className,
	containerClassName,
	headerClassName,
}: DataTableProps<TData>) {
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
		<Table className={className} containerClassName={containerClassName}>
			{columns.map((column) => column.header).filter(Boolean).length > 0 && (
				<TableHeader className={headerClassName}>
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
										colSpan={header.colSpan}
										style={{
											width: header.getSize(),
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
										<div
											{...{
												onMouseDown: header.getResizeHandler(),
												onTouchStart: header.getResizeHandler(),
												className: `resizer absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize select-none touch-none ${
													header.column.getIsResizing() ? 'opacity-100 bg-elements-strong-blue' : ''
												}`,
											}}
										/>
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
										width: cell.column.getSize(),
									}}
									onClick={(e) => {
										e.stopPropagation();
										onCellClick?.(cell);
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
