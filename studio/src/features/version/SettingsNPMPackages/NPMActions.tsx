import { AddNPMPackagesButton } from '@/features/version/SettingsNPMPackages';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { NPMPackage } from '@/types';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';

interface NPMActionsProps {
	table: Table<NPMPackage>;
}
export default function NPMActions({ table }: NPMActionsProps) {
	const { version } = useVersionStore();
	const { deleteMultipleNPMPackages } = useSettingsStore();
	const canDeleteMultiple = useAuthorizeVersion('version.package.delete');
	async function deleteHandler() {
		if (!version) return;
		await deleteMultipleNPMPackages({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			packageIds: table.getSelectedRowModel().rows.map((row) => row.original._id) as string[],
		});
		table?.resetRowSelection();
	}

	return (
		<div className='flex gap-4'>
			{!!table.getSelectedRowModel().rows.length && (
				<SelectedRowButton table={table} onDelete={deleteHandler} disabled={!canDeleteMultiple} />
			)}
			<AddNPMPackagesButton />
		</div>
	);
}
