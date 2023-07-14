import { SelectedRowDropdown } from 'components/Table';
import { Row } from '@tanstack/react-table';
import { RateLimit } from '@/types';
import { AddRateLimitButton } from '@/features/version/SettingsRateLimits/index.ts';
import useVersionStore from '@/store/version/versionStore.ts';

interface RateLimitsActionsProps {
	selectedRows: Row<RateLimit>[] | undefined;
}
export default function RateLimitsActions({ selectedRows }: RateLimitsActionsProps) {
	const { version, deleteMultipleRateLimits } = useVersionStore();
	async function deleteHandler() {
		if (!version) return;
		deleteMultipleRateLimits({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			limitIds: selectedRows?.map((row) => row.original._id) as string[],
		});
	}

	return (
		<div className='flex gap-4'>
			{!!selectedRows?.length && (
				<SelectedRowDropdown onDelete={deleteHandler} selectedRowLength={selectedRows?.length} />
			)}
			<AddRateLimitButton />
		</div>
	);
}
