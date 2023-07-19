import { removeLastSlash } from '@/utils';
import { Database, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useMemo } from 'react';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { Link, useLocation, useParams } from 'react-router-dom';
import { SearchInput } from 'components/SearchInput';
import { Button } from 'components/Button';
import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { Row } from '@tanstack/react-table';
import { SelectedRowDropdown } from 'components/Table';
import { CreateModelButton } from '@/features/database/models/ListModels/index.ts';

interface ModelActionsProps {
	setSelectedRows: Dispatch<SetStateAction<Row<Model>[] | undefined>>;
	selectedRows: Row<Model>[] | undefined;
	setSearch: Dispatch<SetStateAction<string>>;
}
export default function ModelActions({ selectedRows, setSearch }: ModelActionsProps) {
	const { databases } = useDatabaseStore();
	const { t } = useTranslation();
	const { dbId } = useParams();

	const database = useMemo(() => {
		return databases.find((database) => database._id === dbId) as Database;
	}, [databases, dbId]);

	const { pathname } = useLocation();

	const goBackLink = removeLastSlash(
		pathname
			.split(dbId as string)
			.slice(0, -1)
			.join('/'),
	);

	return (
		<>
			<div className='h-20 shrink-0 flex items-center gap-x-6'>
				<Button to={goBackLink} className='text-lg border-none h-8 w-8 p-0' variant='secondary'>
					<ArrowLeft weight='bold' />
				</Button>
				<div className='flex items-center gap-2 text-sm leading-6'>
					<span className='text-default'>{t('database.page_title')}</span>
					<CaretRight className='text-icon-base' weight='bold' size={20} />
					<Link to={goBackLink} className='!text-subtle hover:underline'>
						{database?.name}
					</Link>
				</div>
			</div>
			<div className='flex flex-col gap-2 sm:items-center sm:flex-row justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>
					{t('database.models.title', {
						database: database?.name,
					})}
				</h1>
				<div className='flex gap-4 w-full sm:w-auto'>
					<SearchInput
						onChange={(e) => setSearch(e.target.value)}
						className='flex-1 lg:w-[450px]'
					/>
					{!!selectedRows?.length && (
						<SelectedRowDropdown onDelete={() => {}} selectedRowLength={selectedRows?.length} />
					)}
					<CreateModelButton />
				</div>
			</div>
		</>
	);
}
