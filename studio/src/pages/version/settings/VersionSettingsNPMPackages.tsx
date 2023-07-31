import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { NPMActions, SettingsNPMPackages } from '@/features/version/SettingsNPMPackages';
import { NPMPackage } from '@/types';

export default function VersionSettingsNPMPackages() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<NPMPackage>[]>();
	const [table, setTable] = useState<Table<NPMPackage>>();

	return (
		<SettingsContainer
			action={
				<NPMActions table={table} setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
			}
			pageTitle={t('version.settings.npm_packages')}
			className='table-view'
		>
			<SettingsNPMPackages
				setTable={setTable}
				selectedRows={selectedRows}
				setSelectedRows={setSelectedRows}
			/>
		</SettingsContainer>
	);
}
