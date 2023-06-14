import { useTranslation } from 'react-i18next';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';

export default function ProfileSettingsNotifications() {
	const { t } = useTranslation();
	return (
		<UserSettingsLayout
			title={t('profileSettings.notifications_title')}
			description={t('profileSettings.notifications_description')}
		>
			page content
		</UserSettingsLayout>
	);
}
