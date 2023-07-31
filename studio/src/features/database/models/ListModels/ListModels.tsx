import { cn } from '@/utils';
import { Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { DataTable } from 'components/DataTable';
import {
	CreateModelButton,
	ModelActions,
	ModelColumns,
} from '@/features/database/models/ListModels/index.ts';
import { Row, Table } from '@tanstack/react-table';
import { EmptyState } from 'components/EmptyState';
import { Model as ModelIcon } from '@/components/icons';
import useModelStore from '@/store/database/modelStore.ts';

export default function ListModels() {
	const { models } = useModelStore();
	const [selectedRows, setSelectedRows] = useState<Row<Model>[]>();
	const [search, setSearch] = useState('');
	const { t } = useTranslation();
	const [table, setTable] = useState<Table<Model>>();

	const filteredModels = useMemo(() => {
		if (!search) return models;

		return models.filter((model) => {
			return model.name.toLowerCase().includes(search.toLowerCase());
		});
	}, [search, models]);

	const hasNoModels = filteredModels.length === 0;

	return (
		<div className='px-6 h-full flex flex-col overflow-auto'>
			<ModelActions
				table={table}
				setSearch={setSearch}
				selectedRows={selectedRows}
				setSelectedRows={setSelectedRows}
			/>
			<div
				className={cn(
					!hasNoModels && 'py-6',
					hasNoModels && 'flex-1 flex items-center justify-center',
				)}
			>
				{hasNoModels ? (
					<EmptyState
						title={t('database.models.no_models')}
						icon={<ModelIcon className='text-[150px]' />}
					>
						<CreateModelButton />
					</EmptyState>
				) : (
					<DataTable<Model>
						columns={ModelColumns}
						data={filteredModels}
						setTable={setTable}
						noDataMessage={<p className='text-xl'>{t('database.models.no_models')}</p>}
						setSelectedRows={setSelectedRows}
					/>
				)}
			</div>
		</div>
	);
}
