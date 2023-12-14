import { AddNPMPackagesButton } from '@/features/version/SettingsNPMPackages';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { NPMPackage } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';

interface NPMActionsProps {
	table: Table<NPMPackage>;
}
export default function NPMActions({ table }: NPMActionsProps) {
	const { version } = useVersionStore();
	const { deleteMultipleNPMPackages } = useSettingsStore();
	const canDeleteMultiple = useAuthorizeVersion('version.package.delete');
	const { mutateAsync: deleteMutate } = useMutation({
		mutationFn: deleteMultipleNPMPackages,
		onSuccess: () => {
			table?.resetRowSelection();
		},
	});
	async function deleteHandler() {
		if (!version) return;
		deleteMutate({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			packageIds: table.getSelectedRowModel().rows.map((row) => row.original._id) as string[],
		});
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
