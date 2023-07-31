import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { SearchInput } from '@/components/SearchInput';
import { ResourceTable } from '@/features/resources';
import useApplicationStore from '@/store/app/applicationStore';
import useResourcesStore from '@/store/resources/resourceStore';
import { Plus } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { PAGE_SIZE } from '@/constants';
import { TableLoading } from '@/components/Table/Table';
import { CreateResource } from '@/features/resources';

export default function OrgResources() {
	const { t } = useTranslation();
	const { application } = useApplicationStore();
	const [searchParams, setSearchParams] = useSearchParams();
	const [page, setPage] = useState(0);
	const {
		resources,
		isDeletedResourceModalOpen,
		deletedResource,
		lastFetchedCount,
		deleteResource,
		getResources,
		toggleCreateResourceModal,
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
		getResources({
			initialFetch: page === 0,
			appId: application?._id as string,
			page,
			size: PAGE_SIZE,
			search: searchParams.get('q') ?? undefined,
		});
	}, [searchParams.get('q'), page]);
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
					<Button variant='primary' onClick={toggleCreateResourceModal}>
						<Plus size={16} />
						<span className='ml-2'>{t('resources.add')}</span>
					</Button>
				</div>
			</div>

			<div className='mt-8'>
				<InfiniteScroll
					next={() => setPage(page + 1)}
					className='max-h-full'
					hasMore={lastFetchedCount >= PAGE_SIZE}
					scrollableTarget='resource-scroll'
					loader={resources.length > 0 && <TableLoading />}
					dataLength={resources.length}
				>
					<ResourceTable resources={resources} />
				</InfiniteScroll>
			</div>
			<CreateResource />
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
		</div>
	);
}
