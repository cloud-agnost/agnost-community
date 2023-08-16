import { cn } from '@/utils';
import { Field, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from 'components/DataTable';
import { Row, Table } from '@tanstack/react-table';
import { EmptyState } from 'components/EmptyState';
import { Model as ModelIcon } from '@/components/icons';
import {
	CreateFieldButton,
	FieldActions,
	FieldColumns,
} from '@/features/database/models/fields/ListFields';

interface ListFieldsProps {
	model: Model;
	parentModel?: Model;
}

export default function ListFields({ model, parentModel }: ListFieldsProps) {
	const [selectedRows, setSelectedRows] = useState<Row<Field>[]>();
	const [search, setSearch] = useState('');
	const { t } = useTranslation();
	const [table, setTable] = useState<Table<Field>>();

	const filteredFields = useMemo(() => {
		if (!search) return model.fields;

		return model.fields.filter((f) => {
			return f.name.toLowerCase().includes(search.toLowerCase());
		});
	}, [search, model]);

	useEffect(() => {
		setSelectedRows((selectedRows) => {
			return selectedRows?.filter((row) => row.original.creator !== 'system');
		});
		if (table) {
			table?.setRowSelection((updater) => {
				return updater;
			});
		}
	}, []);

	const hasNoFields = filteredFields.length === 0;

	return (
		<div className='px-6 h-full flex flex-col overflow-auto'>
			<FieldActions
				table={table}
				model={model}
				parentModel={parentModel}
				setSearch={setSearch}
				selectedRows={selectedRows}
				setSelectedRows={setSelectedRows}
			/>
			<div
				className={cn(
					!hasNoFields && 'py-6',
					hasNoFields && 'flex-1 flex items-center justify-center',
				)}
			>
				{hasNoFields ? (
					<EmptyState
						title={t('database.models.no_models')}
						icon={<ModelIcon className='text-[150px]' />}
					>
						<CreateFieldButton />
					</EmptyState>
				) : (
					<DataTable<Field>
						setTable={setTable}
						columns={FieldColumns}
						data={filteredFields.sort((a, b) => b.order - a.order)}
						noDataMessage={<p className='text-xl'>{t('database.fields.no_fields')}</p>}
						setSelectedRows={setSelectedRows}
					/>
				)}
			</div>
		</div>
	);
}
