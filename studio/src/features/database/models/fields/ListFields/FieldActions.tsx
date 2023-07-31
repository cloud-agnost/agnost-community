import { removeLastSlash } from '@/utils';
import { Database, Field, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useMemo } from 'react';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useLocation, useParams } from 'react-router-dom';
import { SearchInput } from 'components/SearchInput';
import { Button } from 'components/Button';
import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { Row, Table } from '@tanstack/react-table';
import { SelectedRowDropdown } from 'components/Table';
import useModelStore from '@/store/database/modelStore.ts';
import { CreateFieldButton } from '@/features/database/models/fields/ListFields';

interface ModelActionsProps {
	setSelectedRows: Dispatch<SetStateAction<Row<Field>[] | undefined>>;
	selectedRows: Row<Field>[] | undefined;
	setSearch: Dispatch<SetStateAction<string>>;
	table: Table<Field> | undefined;
}
export default function ModelActions({ selectedRows, setSearch, table }: ModelActionsProps) {
	const { databases } = useDatabaseStore();
	const { models, deleteMultipleField } = useModelStore();
	const { t } = useTranslation();
	const { dbId, modelId } = useParams();

	const database = useMemo(() => {
		return databases.find((database) => database._id === dbId) as Database;
	}, [databases, dbId]);

	const model = useMemo(() => {
		return models.find((model) => model._id === modelId) as Model;
	}, [models, modelId]);

	const { pathname } = useLocation();

	const goBackLink = removeLastSlash(
		pathname
			.split(modelId as string)
			.slice(0, -1)
			.join('/'),
	);

	async function deleteHandler() {
		await deleteMultipleField({
			dbId: model.dbId,
			modelId: model._id,
			appId: database.appId,
			orgId: database.orgId,
			versionId: database.versionId,
			fieldIds: selectedRows?.map((row) => row.original._id) as string[],
		});
		table?.resetRowSelection?.();
	}

	return (
		<>
			<div className='h-20 shrink-0 flex items-center gap-x-6'>
				<Button to={goBackLink} className='text-lg border-none h-8 w-8 p-0' variant='secondary'>
					<ArrowLeft weight='bold' />
				</Button>
				<div className='flex items-center gap-2 text-sm leading-6'>
					<span className='text-default'>{t('database.page_title')}</span>
					<CaretRight className='text-icon-base' weight='bold' size={20} />
					<span className='text-default'>{database?.name}</span>
					<CaretRight className='text-icon-base' weight='bold' size={20} />
					<span className='text-subtle'>{model?.name}</span>
				</div>
			</div>
			<div className='flex flex-col gap-2 sm:items-center sm:flex-row justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>
					{t('database.fields.title', {
						model: model?.name,
					})}
				</h1>
				<div className='flex gap-4 w-full sm:w-auto'>
					<SearchInput
						onChange={(e) => setSearch(e.target.value)}
						className='flex-1 lg:w-[450px]'
					/>
					{!!selectedRows?.length && (
						<SelectedRowDropdown
							table={table}
							onDelete={deleteHandler}
							selectedRowLength={selectedRows?.length}
						/>
					)}
					<CreateFieldButton />
				</div>
			</div>
		</>
	);
}
