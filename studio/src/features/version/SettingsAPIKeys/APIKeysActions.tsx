import { AddAPIKeyButton } from '@/features/version/SettingsAPIKeys';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIKey } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';

interface APIKeysActionsProps {
	table: Table<APIKey>;
}
export default function APIKeysActions({ table }: APIKeysActionsProps) {
	const { version } = useVersionStore();
	const { deleteMultipleAPIKeys } = useSettingsStore();
	const canDeleteMultiple = useAuthorizeVersion('version.key.delete');
	const { mutateAsync: deleteMutate } = useMutation({
		mutationFn: deleteMultipleAPIKeys,
		onSuccess: () => {
			table?.resetRowSelection();
		},
	});
	async function onDelete() {
		if (!version || table?.getSelectedRowModel().rows?.length === 0) return;

		deleteMutate({
			appId: version.appId,
			keyIds: table?.getSelectedRowModel().rows.map((row) => row.original._id),
			versionId: version._id,
			orgId: version.orgId,
		});

		table?.resetRowSelection();
	}

	return (
		<div className='flex gap-4'>
			{!!table?.getSelectedRowModel().rows?.length && (
				<SelectedRowButton<APIKey>
					table={table}
					onDelete={onDelete}
					disabled={!canDeleteMultiple}
				/>
			)}
			<AddAPIKeyButton />
		</div>
	);
}
