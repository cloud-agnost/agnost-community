import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { TableLoading } from '@/components/Table/Table';
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
import { cn, isEmpty } from '@/utils';
import { Table as TableIcon } from '@phosphor-icons/react';
import { DataTable } from 'components/DataTable';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Navigator() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [searchParams, setSearchParams] = useSearchParams();
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
	const { model, setModel, models, subModel, resetNestedModels, getModelsTitle } = useModelStore();
	const title = getModelsTitle();
	const canMultiDelete = true;
	const hasSubModel = !isEmpty(subModel);
	const columns = useNavigatorColumns(hasSubModel ? subModel.fields : model?.fields);
	const { orgId, appId, versionId } = useParams<{
		orgId: string;
		appId: string;
		versionId: string;
	}>();

	const table = useTable({
		columns,
		data: hasSubModel ? subModelData : data,
	});

	const dbUrl = `/organization/${orgId}/apps/${appId}/version/${versionId}/database`;

	async function deleteHandler() {
		const ids = table?.getSelectedRowModel().rows.map((row) => row.original.id);
		await deleteMultipleDataFromModel({
			ids,
			onSuccess: () => {
				table?.toggleAllRowsSelected(false);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
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
		if (model && isEmpty(subModel)) {
			refetch();
		}
	}, [model, subModel]);
	const { hasNextPage, fetchNextPage, isFetching, isFetchingNextPage, refetch } = useInfiniteScroll(
		{
			queryFn: getDataFromModel,
			queryKey: 'getDataFromModel',
			lastFetchedPage,
			dataLength: data.length,
			params: {
				id: searchParams.get('ref') as string,
			},
		},
	);
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
			loading={isFetching && !data.length}
			className='!overflow-hidden'
			breadCrumb={<BreadCrumb goBackLink={`${dbUrl}/models`} items={breadcrumbItems} />}
		>
			<div className='flex gap-4 justify-center h-[88%]'>
				<div className=' bg-subtle p-4 rounded-lg w-1/6 space-y-4'>
					<h2 className='text-default text-2xl font-sfCompact'>
						{t('database.models.title')}
						<span className='text-subtle font-sfCompact'> ({models.length})</span>
					</h2>

					<div>
						{models.map((md) => (
							<div key={md._id}>
								<Button
									className={cn(
										'text-default text-base p-2 font-normal',
										model._id === md._id && 'font-bold bg-wrapper-background-hover',
									)}
									variant='blank'
									onClick={() => {
										setModel(md);
										resetNestedModels();
										searchParams.delete('ref');
										setSearchParams(searchParams);
									}}
								>
									<TableIcon className='w-6 h-6 inline-block mr-2' />
									{md.name}
								</Button>
							</div>
						))}
					</div>
				</div>
				{data.length > 0 ? (
					<div className='w-5/6 h-full table-container overflow-auto' id='scroll'>
						<InfiniteScroll
							hasMore={hasNextPage}
							next={fetchNextPage}
							loader={isFetchingNextPage && <TableLoading />}
							dataLength={data.length}
							scrollableTarget='scroll'
							className='!overflow-visible'
						>
							<DataTable<any>
								table={table}
								className='table-fixed w-full relative'
								headerClassName='sticky top-0 z-50'
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
