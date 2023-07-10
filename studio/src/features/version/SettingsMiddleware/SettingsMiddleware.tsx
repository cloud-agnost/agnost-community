import './SettingsMiddleware.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable, SortButton } from 'components/DataTable';
import { Middleware } from '@/types';
import { useState } from 'react';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { Checkbox } from 'components/Checkbox';
import useAuthStore from '@/store/auth/authStore.ts';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { translate } from '@/utils';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DateText } from 'components/DateText';

interface SettingsMiddlewareProps {
	selectedRows: Row<Middleware>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<Middleware>[] | undefined>>;
}

export default function SettingsMiddleware({ setSelectedRows }: SettingsMiddlewareProps) {
	const [page, setPage] = useState(0);
	const { getMiddlewaresOfAppVersion, middlewares } = useMiddlewareStore();
	const { orgId, appId, versionId } = useParams();

	async function getMiddlewares() {
		if (!orgId || !appId || !versionId) return;

		await getMiddlewaresOfAppVersion({
			orgId,
			appId,
			versionId,
			page,
			size: 15,
		});
	}

	function next() {
		setPage((prevState) => prevState + 1);
		getMiddlewares();
	}

	return (
		<div className='middlewares-data-table'>
			<InfiniteScroll
				next={next}
				hasMore={true}
				scrollableTarget='setting-container-content'
				loader={<></>}
				dataLength={middlewares.length}
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
		size: 40,
	},
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		size: 400,
	},
	{
		id: 'createdAt',
		header: ({ column }) => (
			<SortButton text={translate('general.created_at').toUpperCase()} column={column} />
		),
		accessorKey: 'createdAt',
		sortingFn: 'datetime',
		enableSorting: true,
		size: 200,
		cell: ({
			row: {
				original: { createdAt, createdBy },
			},
		}) => {
			const isMe = useAuthStore.getState().user?._id === createdBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;

			return <DateText date={createdAt}>{avatar}</DateText>;
		},
	},
	{
		id: 'updatedAt',
		header: ({ column }) => (
			<SortButton text={translate('general.created_at').toUpperCase()} column={column} />
		),
		accessorKey: 'updatedAt',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt, updatedBy },
			},
		}) => {
			const isMe = useAuthStore.getState().user?._id === updatedBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={updatedAt}>{avatar}</DateText>;
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
