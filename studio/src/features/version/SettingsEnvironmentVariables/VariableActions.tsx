import { SelectedRowDropdown } from 'components/Table';
import { Row } from '@tanstack/react-table';
import { Param } from '@/types';
import { AddVariableButton } from '@/features/version/SettingsEnvironmentVariables/';
import useVersionStore from '@/store/version/versionStore.ts';

interface VariableActionsProps {
	selectedRows: Row<Param>[] | undefined;
}
export default function VariableActions({ selectedRows }: VariableActionsProps) {
	const { deleteMultipleParams, version } = useVersionStore();

	function onDelete() {
		if (!version || !selectedRows?.length) return;
		deleteMultipleParams({
			versionId: version._id,
			orgId: version.orgId,
			appId: version.appId,
			paramIds: selectedRows?.map((row) => row.original._id),
		});
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={onDelete} selectedRowLength={selectedRows?.length} />
			)}
			<AddVariableButton />
		</div>
	);
}
