import { SelectedRowDropdown } from 'components/Table';
import { Row, Table } from '@tanstack/react-table';
import { AddNPMPackagesButton } from '@/features/version/SettingsNPMPackages';
import useVersionStore from '@/store/version/versionStore.ts';
import { NPMPackage } from '@/types';
import { Dispatch, SetStateAction } from 'react';

interface NPMActionsProps {
	selectedRows: Row<NPMPackage>[] | undefined;
	table: Table<NPMPackage> | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<NPMPackage>[] | undefined>>;
}
export default function NPMActions({ selectedRows, table, setSelectedRows }: NPMActionsProps) {
	const { version, deleteMultipleNPMPackages } = useVersionStore();
	async function deleteHandler() {
		if (!version) return;
		await deleteMultipleNPMPackages({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			packageIds: selectedRows?.map((row) => row.original._id) as string[],
		});
		table?.resetRowSelection();
		setSelectedRows?.([]);
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown
					table={table}
					onDelete={deleteHandler}
					selectedRowLength={selectedRows?.length}
				/>
			)}
			<AddNPMPackagesButton />
		</div>
	);
}
