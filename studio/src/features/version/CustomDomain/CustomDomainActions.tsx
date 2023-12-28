import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import { CustomDomain } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';
import { useParams } from 'react-router-dom';
import AddCustomDomainButton from './AddCustomDomainButton';
import { SearchInput } from '@/components/SearchInput';
import { useSearchParams } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore';
interface CustomDomainActionsProps {
	table: Table<CustomDomain>;
}
export default function CustomDomainActions({ table }: CustomDomainActionsProps) {
	const { notify } = useToast();
	const [searchParams] = useSearchParams();
	const canDeleteMultiple = useAuthorizeVersion('domain.delete');
	const { deleteMultipleCustomDomains } = useSettingsStore();
	const { versionId, orgId, appId } = useParams() as Record<string, string>;
	const { mutateAsync: deleteDomain } = useMutation({
		mutationFn: deleteMultipleCustomDomains,
		onSuccess: () => {
			table?.toggleAllRowsSelected(false);
		},
		onError: (error) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	function deleteMultipleDomainsHandler() {
		deleteDomain({
			domainIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId,
			appId,
			versionId,
		});
	}

	return (
		<div className='flex gap-4'>
			<SearchInput value={searchParams.get('q') ?? undefined} className='sm:w-[450px] flex-1' />
			{!!table?.getSelectedRowModel().rows?.length && (
				<SelectedRowButton<CustomDomain>
					table={table}
					onDelete={deleteMultipleDomainsHandler}
					disabled={!canDeleteMultiple}
				/>
			)}
			<AddCustomDomainButton />
		</div>
	);
}
