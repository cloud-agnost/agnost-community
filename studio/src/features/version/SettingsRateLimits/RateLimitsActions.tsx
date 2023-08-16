import { SelectedRowButton } from 'components/Table';
import { Row, Table } from '@tanstack/react-table';
import { RateLimit } from '@/types';
import { AddRateLimitButton } from '@/features/version/SettingsRateLimits/index.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { Dispatch, SetStateAction } from 'react';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

interface RateLimitsActionsProps {
	selectedRows: Row<RateLimit>[] | undefined;
	table: Table<RateLimit> | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<RateLimit>[] | undefined>>;
}
export default function RateLimitsActions({
	table,
	selectedRows,
	setSelectedRows,
}: RateLimitsActionsProps) {
	const { version, deleteMultipleRateLimits } = useVersionStore();
	const canDeleteMultiple = useAuthorizeVersion('version.limit.delete');
	async function deleteHandler() {
		if (!version) return;
		await deleteMultipleRateLimits({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			limitIds: selectedRows?.map((row) => row.original._id) as string[],
		});
		table?.resetRowSelection();
		setSelectedRows?.([]);
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowButton<RateLimit>
					table={table}
					onDelete={deleteHandler}
					selectedRowLength={selectedRows?.length}
					disabled={!canDeleteMultiple}
				/>
			)}
			<AddRateLimitButton />
		</div>
	);
}
