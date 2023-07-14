import { SelectedRowDropdown } from 'components/Table';
import { Row } from '@tanstack/react-table';
import { AddNPMPackagesButton } from '@/features/version/SettingsNPMPackages';
import useVersionStore from '@/store/version/versionStore.ts';
import { NPMPackage } from '@/types';

interface NPMActionsProps {
	selectedRows: Row<NPMPackage>[] | undefined;
}
export default function NPMActions({ selectedRows }: NPMActionsProps) {
	const { version, deleteMultipleNPMPackages } = useVersionStore();
	async function deleteHandler() {
		if (!version) return;
		deleteMultipleNPMPackages({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			packageIds: selectedRows?.map((row) => row.original._id) as string[],
		});
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={deleteHandler} selectedRowLength={selectedRows?.length} />
			)}
			<AddNPMPackagesButton />
		</div>
	);
}
