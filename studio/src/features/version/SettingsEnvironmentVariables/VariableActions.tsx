import { SelectedRowDropdown } from 'components/Table';
import { Row, Table } from '@tanstack/react-table';
import { Param } from '@/types';
import { AddVariableButton } from '@/features/version/SettingsEnvironmentVariables/';
import useVersionStore from '@/store/version/versionStore.ts';
import { Dispatch, SetStateAction } from 'react';

interface VariableActionsProps {
	selectedRows: Row<Param>[] | undefined;
	table: Table<Param> | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<Param>[] | undefined>>;
}
export default function VariableActions({
	selectedRows,
	table,
	setSelectedRows,
}: VariableActionsProps) {
	const { deleteMultipleParams, version } = useVersionStore();

	async function onDelete() {
		if (!version || !selectedRows?.length) return;
		await deleteMultipleParams({
			versionId: version._id,
			orgId: version.orgId,
			appId: version.appId,
			paramIds: selectedRows?.map((row) => row.original._id),
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
			<AddVariableButton />
		</div>
	);
}
