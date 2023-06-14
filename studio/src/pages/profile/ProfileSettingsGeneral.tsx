import { useTranslation } from 'react-i18next';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';

export default function ProfileSettingsGeneral() {
	const { t } = useTranslation();
	return (
		<UserSettingsLayout
			title={t('profileSettings.general_title')}
			description={t('profileSettings.general_description')}
		>
			<h1>Gelecek devamı</h1>
		</UserSettingsLayout>
	);
}
