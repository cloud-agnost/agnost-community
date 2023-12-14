import { AddRateLimitButton } from '@/features/version/SettingsRateLimits/index.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { RateLimit } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';

interface RateLimitsActionsProps {
	table: Table<RateLimit>;
}
export default function RateLimitsActions({ table }: RateLimitsActionsProps) {
	const { version } = useVersionStore();
	const { deleteMultipleRateLimits } = useSettingsStore();
	const canDeleteMultiple = useAuthorizeVersion('version.limit.delete');
	const { mutateAsync: deleteMutate } = useMutation({
		mutationFn: deleteMultipleRateLimits,
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
			limitIds: table?.getSortedRowModel().rows.map((row) => row.original._id) as string[],
		});
	}
	return (
		<div className='flex gap-4'>
			{!!table?.getSelectedRowModel().rows.length && (
				<SelectedRowButton<RateLimit>
					table={table}
					onDelete={deleteHandler}
					disabled={!canDeleteMultiple}
				/>
			)}
			<AddRateLimitButton />
		</div>
	);
}
