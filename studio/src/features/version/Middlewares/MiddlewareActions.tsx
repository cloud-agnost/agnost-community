import { SelectedRowDropdown } from 'components/Table';
import { AddMiddlewareButton } from '@/features/version/Middlewares/index.ts';
import { Row } from '@tanstack/react-table';
import { Middleware } from '@/types';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';

interface MiddlewareActionsProps {
	selectedRows: Row<Middleware>[] | undefined;
}
export default function MiddlewareActions({ selectedRows }: MiddlewareActionsProps) {
	const { deleteMiddleware, deleteMultipleMiddlewares } = useMiddlewareStore();
	async function deleteHandler() {
		const rows = selectedRows?.map((row) => row.original);
		if (!rows || rows.length === 0) return;
		const { orgId, versionId, appId } = rows[0];

		if (rows.length === 1) {
			await deleteMiddleware({
				orgId,
				versionId,
				appId,
				mwId: rows[0]._id,
			});
		} else {
			await deleteMultipleMiddlewares({
				orgId,
				versionId,
				appId,
				middlewareIds: rows.map((row) => row._id),
			});
		}
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={deleteHandler} selectedRowLength={selectedRows?.length} />
			)}
			<AddMiddlewareButton />
		</div>
	);
}
