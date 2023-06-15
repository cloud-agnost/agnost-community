import { useTranslation } from 'react-i18next';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';
import { ProfileSettingsForm } from '@/features/auth/components/ProfileSettingsForm';

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
