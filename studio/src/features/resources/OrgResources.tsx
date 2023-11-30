import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { SearchInput } from '@/components/SearchInput';
import { AddResourceButton, EditResourceDrawer } from '@/features/resources';
import { useTable } from '@/hooks';
import useResourcesStore from '@/store/resources/resourceStore';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ResourceTableColumn } from './ResourceTable/ResourceTableColumn';
import { useMutation, useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/EmptyState';
import BeatLoader from 'react-spinners/BeatLoader';
import { APIError } from '@/types';
import { useToast } from '@/hooks';
export default function OrgResources() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [searchParams] = useSearchParams();

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
	});

	const { mutateAsync: deleteMutate, isPending: deleteLoading } = useMutation({
		mutationFn: deleteResource,
		mutationKey: ['deleteResource'],
		onError: (error: APIError) => {
			console.log(error);
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	function getResources() {
		return getOrgResources({
			search: searchParams.get('q') as string,
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
				onConfirm={() => deleteMutate(deletedResource?._id as string)}
				isOpen={isDeletedResourceModalOpen}
				closeModal={closeDeleteResourceModal}
				loading={deleteLoading}
				closable
			/>
			<EditResourceDrawer />
		</div>
	) : (
		<div className='flex items-center justify-center h-full'>
			<BeatLoader color='#6884FD' size={24} margin={18} />
		</div>
	);
}
