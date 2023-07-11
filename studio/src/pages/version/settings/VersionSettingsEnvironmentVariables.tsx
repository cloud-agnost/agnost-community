import { SettingsContainer } from '@/features/version/SettingsContainer';
import {
	SettingsEnvironmentVariables,
	VariableActions,
} from '@/features/version/SettingsEnvironmentVariables';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Param } from '@/types';

export default function VersionSettingsEnvironmentVariables() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<Param>[]>();

	return (
		<SettingsContainer
			pageTitle={t('version.settings.environment_variables')}
			action={<VariableActions selectedRows={selectedRows} />}
			className='table-view'
		>
			<SettingsEnvironmentVariables selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
		</SettingsContainer>
	);
}
