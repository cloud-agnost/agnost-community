import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { SelectedRowDropdown } from '@/components/Table';
import { Endpoint } from '@/types';
import { Plus } from '@phosphor-icons/react';
import { Row, Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
interface EndpointFilterProps {
	table: Table<any>;
	selectedRows: Row<Endpoint>[];
	setPage: (page: number) => void;
}
export default function EndpointFilter({ table, selectedRows, setPage }: EndpointFilterProps) {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		setPage(0);
		setSearchParams({ ...searchParams, q: value });
	}
	return (
		<div className='flex items-center justify-between'>
			<h1 className='text-default text-2xl font-semibold text-center'>{t('endpoint.title')}</h1>
			<div className='flex items-center justify-center gap-6'>
				<SearchInput
					value={searchParams.get('q') ?? undefined}
					onSearch={onInput}
					className='sm:w-[450px] flex-1'
				/>
				<SelectedRowDropdown
					selectedRowLength={selectedRows.length}
					table={table as Table<any>}
					onDelete={() => {
						console.log('delete');
					}}
				/>
				<Button
					variant='primary'
					onClick={() => {
						console.log('click');
					}}
				>
					<Plus size={16} />
					<span className='ml-2'>{t('endpoint.add')}</span>
				</Button>
			</div>
		</div>
	);
}
