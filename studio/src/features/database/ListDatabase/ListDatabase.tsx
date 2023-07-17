import { DataTable } from 'components/DataTable';
import { Database } from '@/types';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { EmptyState } from 'components/EmptyState';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { DatabaseIcon } from 'components/icons';
import { CreateDatabaseButton } from '@/features/database/CreateDatabaseButton';
import { DatabaseColumns } from '@/features/database/ListDatabase/index.ts';

export default function ListDatabase() {
	const [, setSelectedRows] = useState<Row<Database>[]>();
	const { t } = useTranslation();

	const { databasesForSearch } = useDatabaseStore();
	return (
		<div
			className={cn(databasesForSearch.length === 0 && 'flex items-center justify-center h-full')}
		>
			{databasesForSearch.length === 0 ? (
				<EmptyState
					title={t('version.middleware.no_middleware_found')}
					icon={<DatabaseIcon className='text-[110px]' />}
				>
					<CreateDatabaseButton />
				</EmptyState>
			) : (
				<DataTable<Database>
					columns={DatabaseColumns}
					data={databasesForSearch}
					noDataMessage={<p className='text-xl'>{t('version.middleware.no_middleware_found')}</p>}
					setSelectedRows={setSelectedRows}
				/>
			)}
		</div>
	);
}
