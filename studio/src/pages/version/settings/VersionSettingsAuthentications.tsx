import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';

export default function versionSettingsAuthentications() {
	const { t } = useTranslation();

	return (
		<SettingsContainer pageTitle={t('version.settings.authentications')}>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at atque commodi dicta,
			explicabo hic incidunt iste perspiciatis possimus provident quas voluptas. Exercitationem
			fugiat illum mollitia saepe totam. Facere, ut!
		</SettingsContainer>
	);
}
