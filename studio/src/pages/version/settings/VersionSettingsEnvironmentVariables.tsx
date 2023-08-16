import { SettingsContainer } from '@/features/version/SettingsContainer';
import {
	SettingsEnvironmentVariables,
	VariableActions,
} from '@/features/version/SettingsEnvironmentVariables';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { Param } from '@/types';

export default function VersionSettingsEnvironmentVariables() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<Param>[]>();
	const [table, setTable] = useState<Table<Param>>();

	return (
		<SettingsContainer
			pageTitle={t('version.settings.environment_variables')}
			action={
				<VariableActions
					setSelectedRows={setSelectedRows}
					table={table}
					selectedRows={selectedRows}
				/>
			}
			className='table-view'
		>
			<SettingsEnvironmentVariables
				setTable={setTable}
				selectedRows={selectedRows}
				setSelectedRows={setSelectedRows}
			/>
		</SettingsContainer>
	);
}
