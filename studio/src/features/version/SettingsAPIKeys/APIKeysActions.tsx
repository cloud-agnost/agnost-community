import { SelectedRowDropdown } from 'components/Table';
import { Row } from '@tanstack/react-table';
import { APIKey } from '@/types';
import { AddAPIKeyButton } from '@/features/version/SettingsAPIKeys';

interface APIKeysActionsProps {
	selectedRows: Row<APIKey>[] | undefined;
}
export default function APIKeysActions({ selectedRows }: APIKeysActionsProps) {
	function onDelete() {}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={onDelete} selectedRowLength={selectedRows?.length} />
			)}
			<AddAPIKeyButton />
		</div>
	);
}
