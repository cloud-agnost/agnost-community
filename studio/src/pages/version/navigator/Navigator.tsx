import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { TableLoading } from '@/components/Table/Table';
import { Refresh } from '@/components/icons';
import { MODULE_PAGE_SIZE } from '@/constants';
import { SelectModel } from '@/features/database';
import { useNavigatorColumns, useTable, useToast, useUpdateEffect } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError, TabTypes } from '@/types';
import { isEmpty } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { DataTable } from 'components/DataTable';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';

export default function Navigator() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [searchParams] = useSearchParams();
	const {
		setEditedField,
		getDataFromModel,
		deleteMultipleDataFromModel,
		getDataOfSelectedModel,
		lastFetchedCount,
		data: stateData,
		editedField,
		subModelData,
		lastFetchedPage,
	} = useNavigatorStore();
	const database = useDatabaseStore((state) => state.database);
	const [isFetching, setIsFetching] = useState(false);
	const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
	const { model, subModel } = useModelStore();
	const canMultiDelete = true;
	const hasSubModel = !isEmpty(subModel);
	const columns = useNavigatorColumns(hasSubModel ? subModel?.fields : model?.fields);
	const { orgId, appId, versionId, modelId } = useParams() as Record<string, string>;
	const isSorted = searchParams.get('f') && searchParams.get('d');
	const scrollContainer = useRef<HTMLDivElement>(null);
	const data = useMemo(() => getDataOfSelectedModel(modelId) ?? [], [modelId, stateData]);
	const table = useTable({
		columns,
		data: hasSubModel ? subModelData?.[modelId] : data,
	});

	const dbUrl = `/organization/${orgId}/apps/${appId}/version/${versionId}/database`;
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { mutateAsync: deleteMultipleMutate } = useMutation({
		mutationFn: deleteMultipleDataFromModel,
		mutationKey: ['deleteMultipleDataFromModel'],
		onSuccess: () => table.resetRowSelection(),
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
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

	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: database.name,
			url: dbUrl,
		},
		{
			name: model?.name,
			url: `${dbUrl}/${database._id}/models`,
		},
		{
			name: t('database.navigator.title').toString(),
		},
	];

	async function onRefresh() {
		setIsRefreshing(true);
		await fetchData(0, MODULE_PAGE_SIZE);
		setIsRefreshing(false);
	}

	async function fetchData(page: number, size: number = MODULE_PAGE_SIZE) {
		setIsFetching(true);
		await getDataFromModel({
			page,
			size,
			sortBy: searchParams.get('f') as string,
			sortDir: searchParams.get('d') as string,
			id: searchParams.get('ref') as string,
		});
		setIsFetching(false);
	}

	async function fetchNextPage() {
		setIsFetchingNextPage(true);
		const page = _.isNil(lastFetchedPage?.[modelId]) ? 0 : (lastFetchedPage[modelId] ?? 0) + 1;
		await fetchData(page);
		setIsFetchingNextPage(false);
	}

	useUpdateEffect(() => {
		if (searchParams.get('f') || searchParams.get('d') || searchParams.get('ref')) {
			const page = lastFetchedPage?.[modelId] ?? 0;
			const size = lastFetchedPage?.[modelId] ? MODULE_PAGE_SIZE * page : MODULE_PAGE_SIZE;
			fetchData(0, size);
		}
	}, [searchParams.get('f'), searchParams.get('d'), searchParams.get('ref')]);

	useEffect(() => {
		if (_.isEmpty(data)) {
			fetchData(0);
		}
	}, []);

	useUpdateEffect(() => {
		if (scrollContainer?.current) {
			scrollContainer.current.style.overflow =
				isFetching && !isFetchingNextPage ? 'hidden' : 'auto';
		}
	}, [isFetching]);

	return (
		<VersionTabLayout
			isEmpty={false}
			type={TabTypes.Field}
			emptyStateTitle={t('database.fields.no_fields')}
			table={table}
			disabled={!canMultiDelete}
			onMultipleDelete={deleteHandler}
			loading={false}
			className='!overflow-hidden'
			breadCrumb={<BreadCrumb items={breadcrumbItems} />}
			handlerButton={
				<Button variant='secondary' onClick={onRefresh} iconOnly loading={isRefreshing}>
					{!isRefreshing && <Refresh className='mr-2 w-5 h-5' />}
					{t('general.refresh')}
				</Button>
			}
		>
			{!_.isEmpty(model) ? (
				<div className='flex gap-4 justify-center h-[calc(100%-52px)]'>
					<SelectModel fetchData={fetchData} />
					{isFetching && !isSorted && !isFetchingNextPage ? (
						<div className='flex-1 flex items-center justify-center'>
							<BeatLoader color='#6884FD' size={24} margin={18} />
						</div>
					) : data.length > 0 ? (
						<div className='w-5/6 table-container overflow-auto' id='scroll' ref={scrollContainer}>
							<InfiniteScroll
								hasMore={(lastFetchedCount?.[modelId] ?? 0) >= MODULE_PAGE_SIZE}
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
						<div className='flex-1 '>
							<EmptyState title={t('database.models.no_data')} type={TabTypes.Database} />
						</div>
					)}
				</div>
			) : (
				<div className='flex-1 flex flex-col justify-center items-center h-full w-full'>
					<EmptyState title={t('database.models.no_models')} type={TabTypes.Model} />
				</div>
			)}
		</VersionTabLayout>
	);
}
