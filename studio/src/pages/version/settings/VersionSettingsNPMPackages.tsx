import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { NPMActions, SettingsNPMPackages } from '@/features/version/SettingsNPMPackages';
import { NPMPackage } from '@/types';

export default function VersionSettingsNPMPackages() {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<NPMPackage>[]>();

	return (
		<SettingsContainer
			action={<NPMActions selectedRows={selectedRows} />}
			pageTitle={t('version.settings.npm_packages')}
			className='table-view'
		>
			<SettingsNPMPackages selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
		</SettingsContainer>
	);
}
