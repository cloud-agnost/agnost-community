import { AddMiddlewareButton } from '@/features/version/Middlewares/index.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { Middleware } from '@/types';
import { Row } from '@tanstack/react-table';
import { SearchInput } from 'components/SearchInput';
import { SelectedRowButton } from 'components/Table';
import { useSearchParams } from 'react-router-dom';

interface MiddlewareActionsProps {
	selectedRows: Row<Middleware>[] | undefined;
	onSearch?: (value: string) => void;
}
export default function MiddlewareActions({ selectedRows, onSearch }: MiddlewareActionsProps) {
	const { deleteMiddleware, deleteMultipleMiddlewares } = useMiddlewareStore();
	const [searchParams, setSearchParams] = useSearchParams();
	const canDeleteMultiple = useAuthorizeVersion('middleware.delete');
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

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		onSearch?.(value);
		setSearchParams({ ...searchParams, q: value });
	}

	return (
		<div className='flex gap-4'>
			<SearchInput
				value={searchParams.get('q') ?? undefined}
				onSearch={onInput}
				className='sm:w-[450px] flex-1'
				placeholder='Search'
			/>
			{!!selectedRows?.length && (
				<SelectedRowButton<Middleware>
					onDelete={deleteHandler}
					selectedRowLength={selectedRows?.length}
					disabled={!canDeleteMultiple}
				/>
			)}
			<AddMiddlewareButton />
		</div>
	);
}
