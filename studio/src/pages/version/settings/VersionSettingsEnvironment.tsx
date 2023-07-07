import { SettingsContainer } from '@/features/version/SettingsContainer';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsEnvironment() {
	const { t } = useTranslation();
	return (
		<SettingsContainer
			info='Last deployment at: Mar 20th, 2023 04:34:15 pm'
			pageTitle={t('version.settings.environment')}
			action={<Button size='lg'>{t('version.redeploy')}</Button>}
		>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aspernatur at atque commodi dicta,
			explicabo hic incidunt iste perspiciatis possimus provident quas voluptas. Exercitationem
			fugiat illum mollitia saepe totam. Facere, ut!
		</SettingsContainer>
	);
}
