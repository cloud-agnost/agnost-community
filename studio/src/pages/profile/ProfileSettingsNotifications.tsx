import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';
import { useTranslation } from 'react-i18next';
import { Notifications } from '@/features/auth/components/Notifications';

export default function ProfileSettingsNotifications() {
	const { t } = useTranslation();
	return (
		<UserSettingsLayout
			title={t('profileSettings.notifications_title')}
			description={t('profileSettings.notifications_description')}
		>
			<Notifications />
		</UserSettingsLayout>
	);
}
