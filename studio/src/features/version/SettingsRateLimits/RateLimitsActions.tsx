import { AddRateLimitButton } from '@/features/version/SettingsRateLimits/index.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { RateLimit } from '@/types';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';

interface RateLimitsActionsProps {
	table: Table<RateLimit>;
}
export default function RateLimitsActions({ table }: RateLimitsActionsProps) {
	const { version } = useVersionStore();
	const { deleteMultipleRateLimits } = useSettingsStore();
	const canDeleteMultiple = useAuthorizeVersion('version.limit.delete');
	async function deleteHandler() {
		if (!version) return;
		await deleteMultipleRateLimits({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			limitIds: table?.getSortedRowModel().rows.map((row) => row.original._id) as string[],
		});
		table?.resetRowSelection();
	}

	return (
		<div className='flex gap-4'>
			{!!table?.getSortedRowModel().rows.length && (
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
