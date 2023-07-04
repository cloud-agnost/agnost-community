import { ProfileSettingsForm } from '@/features/auth/ProfileSettingsForm';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';
import { useTranslation } from 'react-i18next';

export default function ProfileSettingsGeneral() {
	const { t } = useTranslation();
	return (
		<UserSettingsLayout
			title={t('profileSettings.general_title')}
			description={t('profileSettings.general_description')}
		>
			<ProfileSettingsForm />
		</UserSettingsLayout>
	);
}
