import './SettingsAPIKeys.scss';
import { DataTable } from 'components/DataTable';
import { APIKey } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { AddOrEditAPIKeyDrawer, SettingsAPIKeysColumns } from '@/features/version/SettingsAPIKeys/';
import { Row, Table } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { reverseArray } from '@/utils';
import { EmptyState } from 'components/EmptyState';

interface SettingsAPIKeysProps {
	selectedRows: Row<APIKey>[] | undefined;
	setTable: Dispatch<SetStateAction<Table<APIKey> | undefined>>;
	setSelectedRows: Dispatch<SetStateAction<Row<APIKey>[] | undefined>>;
}

export default function SettingsAPIKeys({ setSelectedRows, setTable }: SettingsAPIKeysProps) {
	const apiKeys = useVersionStore((state) => state.version?.apiKeys ?? []);
	const { editAPIKeyDrawerIsOpen, setEditAPIKeyDrawerIsOpen } = useVersionStore();
	const { t } = useTranslation();

	if (apiKeys.length === 0) {
		return (
			<div className='h-full flex items-center justify-center'>
				<EmptyState title={t('version.api_key.no_api_key_found')} />
			</div>
		);
	}

	return (
		<>
			<div className='data-table-container'>
				<DataTable<APIKey>
					columns={SettingsAPIKeysColumns}
					data={reverseArray(apiKeys)}
					setTable={setTable}
					setSelectedRows={setSelectedRows}
					noDataMessage={<p className='text-xl'>{t('version.api_key.no_api_key_found')}</p>}
				/>
			</div>
			<AddOrEditAPIKeyDrawer
				key={editAPIKeyDrawerIsOpen.toString()}
				open={editAPIKeyDrawerIsOpen}
				onOpenChange={setEditAPIKeyDrawerIsOpen}
				editMode
			/>
		</>
	);
}
