import { AddVariableButton } from '@/features/version/SettingsEnvironmentVariables/';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { Param } from '@/types';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';

interface VariableActionsProps {
	table: Table<Param> | undefined;
}
export default function VariableActions({ table }: VariableActionsProps) {
	const { version } = useVersionStore();
	const { deleteMultipleParams } = useSettingsStore();
	const canDeleteMultiple = useAuthorizeVersion('version.param.delete');
	async function onDelete() {
		if (!version || !table?.getSelectedRowModel().rows?.length) return;
		await deleteMultipleParams({
			versionId: version._id,
			orgId: version.orgId,
			appId: version.appId,
			paramIds: table?.getSelectedRowModel().rows?.map((row) => row.original._id),
		});
		table?.resetRowSelection();
	}

	return (
		<div className='flex gap-4'>
			{!!table?.getSelectedRowModel().rows?.length && (
				<SelectedRowButton<Param> table={table} onDelete={onDelete} disabled={!canDeleteMultiple} />
			)}
			<AddVariableButton />
		</div>
	);
}
