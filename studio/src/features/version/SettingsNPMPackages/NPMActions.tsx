import { SelectedRowDropdown } from 'components/Table';
import { Row } from '@tanstack/react-table';
import { AddNPMPackagesButton } from '@/features/version/SettingsNPMPackages';

interface NPMActionsProps {
	selectedRows: Row<any>[] | undefined;
}
export default function NPMActions({ selectedRows }: NPMActionsProps) {
	async function deleteHandler() {}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={deleteHandler} selectedRowLength={selectedRows?.length} />
			)}
			<AddNPMPackagesButton />
		</div>
	);
}
