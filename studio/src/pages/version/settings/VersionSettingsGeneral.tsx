import { SettingsContainer } from '@/features/version/SettingsContainer';
import { SettingsGeneral } from '@/features/version/SettingsGeneral';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsGeneral() {
	const { t } = useTranslation();
	return (
		<SettingsContainer pageTitle={t('version.settings.general')}>
			<SettingsGeneral />
		</SettingsContainer>
	);
}
