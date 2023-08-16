import { SettingsContainer } from '@/features/version/SettingsContainer';
import { APIKeysActions, SettingsAPIKeys } from '@/features/version/SettingsAPIKeys';
import { useState } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { APIKey } from '@/types';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsAPIKeys() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<APIKey>[]>();
	const [table, setTable] = useState<Table<APIKey>>();

	return (
		<SettingsContainer
			action={
				<APIKeysActions
					setSelectedRows={setSelectedRows}
					table={table}
					selectedRows={selectedRows}
				/>
			}
			className='table-view'
			pageTitle={t('version.settings.api_keys')}
		>
			<SettingsAPIKeys
				setTable={setTable}
				setSelectedRows={setSelectedRows}
				selectedRows={selectedRows}
			/>
		</SettingsContainer>
	);
}
