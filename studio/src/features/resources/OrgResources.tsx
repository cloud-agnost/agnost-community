import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { SearchInput } from '@/components/SearchInput';
import { AddResourceButton, EditResourceDrawer } from '@/features/resources';
import { useTable } from '@/hooks';
import useResourcesStore from '@/store/resources/resourceStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

import { ResourceTableColumn } from './ResourceTable/ResourceTableColumn';
import { Loading } from '@/components/Loading';
export default function OrgResources() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const { orgId } = useParams() as Record<string, string>;
	const {
		resources,
		isDeletedResourceModalOpen,
		deletedResource,
		deleteResource,
		getOrgResources,
		closeDeleteResourceModal,
	} = useResourcesStore();

	const table = useTable({
		data: resources,
		columns: ResourceTableColumn,
	});

	const { isPending, refetch } = useQuery({
		queryKey: ['orgResources'],
		queryFn: getResources,
		refetchOnWindowFocus: false,
		enabled: !resources.length,
	});

	const {
		mutateAsync: deleteMutate,
		isPending: deleteLoading,
		error,
	} = useMutation({
		mutationFn: deleteResource,
		mutationKey: ['deleteResource'],
	});

	function getResources() {
		return getOrgResources({
			search: searchParams.get('q') as string,
			orgId,
		});
	}

	useEffect(() => {
		refetch();
	}, [searchParams.get('q')]);

	return !isPending ? (
		<div className='p-8 scroll space-y-8' id='resource-scroll'>
			<div className='flex items-center justify-between'>
				<h1 className='text-default text-2xl font-semibold text-center'>{t('resources.title')}</h1>
				<div className='flex items-center justify-center gap-6'>
					<SearchInput value={searchParams.get('q') ?? undefined} className='sm:w-[450px] flex-1' />
					<AddResourceButton />
				</div>
			</div>
			{resources.length ? (
				<DataTable table={table} />
			) : (
				<EmptyState title={t('resources.empty')} type='resource' />
			)}
			<ConfirmationModal
				title={t('resources.delete.title')}
				alertTitle={t('resources.delete.message')}
				alertDescription={t('resources.delete.description')}
				description={
					<Trans
						i18nKey='profileSettings.delete_confirm_description'
						values={{ confirmCode: deletedResource?.iid as string }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={deletedResource?.iid as string}
				onConfirm={() =>
					deleteMutate({
						resourceId: deletedResource?._id as string,
						orgId,
					})
				}
				isOpen={isDeletedResourceModalOpen}
				closeModal={closeDeleteResourceModal}
				loading={deleteLoading}
				error={error}
				closable
			/>
			<EditResourceDrawer />
		</div>
	) : (
		<Loading loading={isPending} />
	);
}
