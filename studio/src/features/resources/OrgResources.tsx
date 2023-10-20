import { ConfirmationModal } from '@/components/ConfirmationModal';
import { SearchInput } from '@/components/SearchInput';
import { AddResourceButton, EditResourceDrawer, ResourceTable } from '@/features/resources';
import useResourcesStore from '@/store/resources/resourceStore';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

export default function OrgResources() {
	const { t } = useTranslation();

	const [searchParams, setSearchParams] = useSearchParams();
	const {
		resources,
		isDeletedResourceModalOpen,
		deletedResource,
		deleteResource,
		getOrgResources,
		closeDeleteResourceModal,
	} = useResourcesStore();

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		setSearchParams({ ...searchParams, q: value });
	}

	useEffect(() => {
		getOrgResources({
			search: searchParams.get('q') as string,
		});
	}, [searchParams.get('q')]);
	return (
		<div className='p-8 scroll' id='resource-scroll'>
			<div className='flex items-center justify-between'>
				<h1 className='text-default text-2xl font-semibold text-center'>{t('resources.title')}</h1>
				<div className='flex items-center justify-center gap-6'>
					<SearchInput
						value={searchParams.get('q') ?? undefined}
						onSearch={onInput}
						className='sm:w-[450px] flex-1'
					/>
					<AddResourceButton />
				</div>
			</div>

			<div className='mt-8'>
				<ResourceTable resources={resources} />
			</div>
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
				onConfirm={() => deleteResource(deletedResource?._id as string)}
				isOpen={isDeletedResourceModalOpen}
				closeModal={closeDeleteResourceModal}
				closable
			/>
			<EditResourceDrawer />
		</div>
	);
}
