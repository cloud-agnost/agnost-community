import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { TableLoading } from '@/components/Table/Table';
import { Refresh } from '@/components/icons';
import { SelectModel } from '@/features/database';
import {
	useInfiniteScroll,
	useNavigatorColumns,
	useTable,
	useToast,
	useUpdateEffect,
} from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError } from '@/types';
import { isEmpty } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { DataTable } from 'components/DataTable';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';

export default function Navigator() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [searchParams] = useSearchParams();
	const {
		setEditedField,
		getDataFromModel,
		deleteMultipleDataFromModel,
		data,
		editedField,
		subModelData,
		lastFetchedPage,
	} = useNavigatorStore();
	const database = useDatabaseStore((state) => state.database);
	const { model, subModel, getModelsTitle } = useModelStore();
	const title = getModelsTitle();
	const canMultiDelete = true;
	const hasSubModel = !isEmpty(subModel);
	const columns = useNavigatorColumns(hasSubModel ? subModel.fields : model?.fields);
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const isSorted = searchParams.get('f') && searchParams.get('d');
	const table = useTable({
		columns,
		data: hasSubModel ? subModelData : data,
	});

	const dbUrl = `/organization/${orgId}/apps/${appId}/version/${versionId}/database`;

	const { mutateAsync: deleteMultipleMutate } = useMutation({
		mutationFn: deleteMultipleDataFromModel,
		mutationKey: ['deleteMultipleDataFromModel'],
		onSuccess: () => table.resetRowSelection(),
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});

	async function deleteHandler() {
		const ids = table?.getSelectedRowModel().rows.map((row) => row.original.id);
		deleteMultipleMutate({
			ids,
		});
	}

	useEffect(() => {
		setEditedField('');
		document.body.addEventListener('click', () => {
			setEditedField('');
		});
		return () => {
			document.body.removeEventListener('click', () => {
				setEditedField('');
			});
		};
	}, []);

	useUpdateEffect(() => {
		if (model && isEmpty(subModel) && !isSorted) {
			refetch();
		}
	}, [model, subModel]);
	const { hasNextPage, fetchNextPage, isFetching, isFetchingNextPage, refetch, isRefetching } =
		useInfiniteScroll({
			queryFn: getDataFromModel,
			queryKey: 'getDataFromModel',
			lastFetchedPage,
			dataLength: data.length,
			disableVersionParams: true,
			params: {
				id: searchParams.get('ref') as string,
			},
		});
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: database.name,
			url: dbUrl,
		},
		{
			name: model.name,
			url: `${dbUrl}/${database._id}/models`,
		},
		{
			name: t('database.navigator.title').toString(),
		},
	];

	return (
		<VersionTabLayout
			isEmpty={false}
			title={title}
			type='field'
			emptyStateTitle={t('database.fields.no_fields')}
			table={table}
			disabled={!canMultiDelete}
			onMultipleDelete={deleteHandler}
			loading={false}
			className='!overflow-hidden'
			breadCrumb={<BreadCrumb goBackLink={`${dbUrl}/models`} items={breadcrumbItems} />}
			handlerButton={
				<Button variant='secondary' onClick={() => refetch()} iconOnly loading={isRefetching}>
					{!isRefetching && <Refresh className='mr-2 w-5 h-5' />}
					{t('general.refresh')}
				</Button>
			}
		>
			<div className='flex gap-4 justify-center h-[88%]'>
				<SelectModel />
				{isFetching && !isSorted && !isFetchingNextPage ? (
					<div className='flex-1 flex items-center justify-center'>
						<BeatLoader color='#6884FD' size={24} margin={18} />
					</div>
				) : data.length > 0 ? (
					<div className='w-5/6 table-container overflow-auto h-[calc(100vh-18rem)]' id='scroll'>
						<InfiniteScroll
							hasMore={hasNextPage}
							next={fetchNextPage}
							loader={isFetchingNextPage && <TableLoading />}
							dataLength={data.length}
							scrollableTarget='scroll'
							className='!overflow-visible h-full'
						>
							<DataTable<any>
								table={table}
								className='navigator table-fixed w-full h-full relative'
								headerClassName='sticky top-0 z-50'
								containerClassName='!border-none h-full'
								onCellClick={(cell) => {
									if (editedField !== cell.id) setEditedField(cell.id);
								}}
							/>
						</InfiniteScroll>
					</div>
				) : (
					<div className='flex-1'>
						<EmptyState title={t('database.models.no_data')} type='database' />
					</div>
				)}
			</div>
		</VersionTabLayout>
	);
}
