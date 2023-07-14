import { SelectedRowDropdown } from 'components/Table';
import { Row } from '@tanstack/react-table';
import { APIKey } from '@/types';
import { AddAPIKeyButton } from '@/features/version/SettingsAPIKeys';
import useVersionStore from '@/store/version/versionStore.ts';

interface APIKeysActionsProps {
	selectedRows: Row<APIKey>[] | undefined;
}
export default function APIKeysActions({ selectedRows }: APIKeysActionsProps) {
	const { version, deleteMultipleAPIKeys } = useVersionStore();
	function onDelete() {
		if (!version || !selectedRows || selectedRows?.length === 0) return;

		deleteMultipleAPIKeys({
			appId: version.appId,
			keyIds: selectedRows.map((row) => row.original._id),
			versionId: version._id,
			orgId: version.orgId,
		});
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={onDelete} selectedRowLength={selectedRows?.length} />
			)}
			<AddAPIKeyButton />
		</div>
	);
}
