import './SettingsMiddleware.scss';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Middleware } from '@/types';
import { Checkbox } from 'components/Checkbox';
import { formatDate } from '@/utils';
import { DataTable } from 'components/DataTable';
import { InfiniteScroll } from 'components/InfiniteScroll';
import { useState } from 'react';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { useParams } from 'react-router-dom';
import { useUpdateEffect } from '@/hooks';
import { Pencil } from 'components/icons';
import { Button } from 'components/Button';

export default function SettingsMiddleware() {
	const [page, setPage] = useState(0);
	const { getMiddlewaresOfAppVersion } = useMiddlewareStore();
	const [middlewares, setMiddlewares] = useState<Middleware[]>([]);
	const [_, setSelectedRows] = useState<Row<Middleware>[]>();
	const { orgId, appId, versionId } = useParams();

	useUpdateEffect(() => {
		getMiddlewares(page);
	}, [page]);

	async function getMiddlewares(page: number) {
		if (!orgId || !appId || !versionId) return;

		const middlewares = await getMiddlewaresOfAppVersion({
			orgId,
			appId,
			versionId,
			page,
			size: 20,
		});

		setMiddlewares((prevState) => [...prevState, ...middlewares]);
	}

	return (
		<div className='middlewares-data-table'>
			<InfiniteScroll
				items={middlewares}
				endOfList={() => {
					console.log('end of list');
					setPage((prev) => prev + 1);
				}}
			>
				<DataTable<Middleware>
					columns={MiddlewaresColumns}
					data={middlewares}
					setSelectedRows={setSelectedRows}
				/>
			</InfiniteScroll>
		</div>
	);
}

export const MiddlewaresColumns: ColumnDef<Middleware>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
		size: 25,
	},
	{
		id: 'name',
		header: 'NAME',
		accessorKey: 'name',
		size: 100,
	},
	{
		id: 'createdAt',
		header: 'CREATED AT',
		accessorKey: 'createdAt',
		size: 100,
		cell: ({
			row: {
				original: { createdAt },
			},
		}) => {
			return (
				<div>
					<span className='block text-default text-sm leading-6'>
						{formatDate(createdAt, {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
						})}
					</span>
					<time className='text-[11px] text-subtle leading-[21px]'>
						{formatDate(createdAt, {
							hour: 'numeric',
							minute: 'numeric',
						})}
					</time>
				</div>
			);
		},
	},
	{
		id: 'uploadAt',
		header: 'UPLOAD AT',
		accessorKey: 'uploadAt',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt },
			},
		}) => {
			return (
				<div>
					<span className='block text-default text-sm leading-6'>
						{formatDate(updatedAt, {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
						})}
					</span>
					<time className='text-[11px] text-subtle leading-[21px]'>
						{formatDate(updatedAt, {
							hour: 'numeric',
							minute: 'numeric',
						})}
					</time>
				</div>
			);
		},
	},
	{
		id: 'actions',
		size: 45,
		cell: () => {
			return (
				<div className='flex items-center justify-end'>
					<Button iconOnly variant='blank' className='text-xl text-icon-base'>
						<Pencil />
					</Button>
				</div>
			);
		},
	},
];
