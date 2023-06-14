import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';
import { useTranslation } from 'react-i18next';

export default function ProfileSettingsClusterManagement() {
	const { t } = useTranslation();
	return (
		<UserSettingsLayout title={t('profileSettings.clusters_title')}>
			page content
		</UserSettingsLayout>
	);
}
