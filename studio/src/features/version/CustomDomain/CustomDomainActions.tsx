import { SearchInput } from '@/components/SearchInput';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useSettingsStore from '@/store/version/settingsStore';
import { CustomDomain } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';
import { useParams, useSearchParams } from 'react-router-dom';
import AddCustomDomainButton from './AddCustomDomainButton';
interface CustomDomainActionsProps {
	table: Table<CustomDomain>;
	refetch: () => void;
}
export default function CustomDomainActions({ table, refetch }: CustomDomainActionsProps) {
	const { toast } = useToast();
	const [searchParams] = useSearchParams();
	const canDeleteMultiple = useAuthorizeVersion('domain.delete');
	const { deleteMultipleCustomDomains } = useSettingsStore();
	const { versionId, orgId, appId } = useParams() as Record<string, string>;
	const { mutateAsync: deleteDomain } = useMutation({
		mutationFn: deleteMultipleCustomDomains,
		onSuccess: () => {
			refetch();
			table?.toggleAllRowsSelected(false);
		},
		onError: (error) => {
			toast({
				title: error.details,
				action: 'error',
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
			<SearchInput
				value={searchParams.get('q') ?? undefined}
				className='sm:w-[450px] flex-1'
				inputClassName='h-[30px]'
			/>
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
