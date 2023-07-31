import { SelectedRowDropdown } from 'components/Table';
import { Row, Table } from '@tanstack/react-table';
import { APIKey } from '@/types';
import { AddAPIKeyButton } from '@/features/version/SettingsAPIKeys';
import useVersionStore from '@/store/version/versionStore.ts';
import { Dispatch, SetStateAction } from 'react';

interface APIKeysActionsProps {
	selectedRows: Row<APIKey>[] | undefined;
	table: Table<APIKey> | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<APIKey>[] | undefined>>;
}
export default function APIKeysActions({
	selectedRows,
	table,
	setSelectedRows,
}: APIKeysActionsProps) {
	const { version, deleteMultipleAPIKeys } = useVersionStore();
	async function onDelete() {
		if (!version || !selectedRows || selectedRows?.length === 0) return;

		await deleteMultipleAPIKeys({
			appId: version.appId,
			keyIds: selectedRows.map((row) => row.original._id),
			versionId: version._id,
			orgId: version.orgId,
		});
		setSelectedRows([]);
		table?.resetRowSelection();
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown
					table={table}
					onDelete={onDelete}
					selectedRowLength={selectedRows?.length}
				/>
			)}
			<AddAPIKeyButton />
		</div>
	);
}
