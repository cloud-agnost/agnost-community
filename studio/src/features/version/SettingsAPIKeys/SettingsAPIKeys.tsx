import { AddOrEditAPIKeyDrawer, SettingsAPIKeysColumns } from '@/features/version/SettingsAPIKeys/';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIKey } from '@/types';
import { reverseArray } from '@/utils';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { EmptyState } from 'components/EmptyState';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsAPIKeys.scss';

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
				<EmptyState type='apiKey' title={t('version.api_key.no_api_key_found')} />
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
