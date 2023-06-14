import { useTranslation } from 'react-i18next';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';

export default function ProfileSettingsClusterManagement() {
	const { t } = useTranslation();
	return (
		<UserSettingsLayout title={t('profileSettings.clusters_title')}>
			page content
		</UserSettingsLayout>
	);
}
