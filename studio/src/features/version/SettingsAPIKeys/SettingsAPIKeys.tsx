import './SettingsAPIKeys.scss';
import { DataTable } from 'components/DataTable';
import { APIKey } from '@/types';
import useVersionStore from '@/store/version/versionStore.ts';
import { SettingsAPIKeysColumns } from '@/features/version/SettingsAPIKeys/';
import { Row } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsAPIKeysProps {
	selectedRows: Row<APIKey>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<APIKey>[] | undefined>>;
}

export default function SettingsAPIKeys({ setSelectedRows }: SettingsAPIKeysProps) {
	const apiKeys = useVersionStore((state) => state.version?.apiKeys ?? []);
	const { t } = useTranslation();
	return (
		<div className='data-table-container'>
			<DataTable<APIKey>
				columns={SettingsAPIKeysColumns}
				data={apiKeys}
				setSelectedRows={setSelectedRows}
				noDataMessage={<p className='text-xl'>{t('version.variable.no_variable_found')}</p>}
			/>
		</div>
	);
}
