import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';
import { AddMiddlewareButton, SettingsMiddleware } from '@/features/version/SettingsMiddleware';

export default function VersionSettingsMiddlewares() {
	const { t } = useTranslation();

	return (
		<SettingsContainer
			action={<AddMiddlewareButton />}
			pageTitle={t('version.settings.middlewares')}
			className='version-settings-middlewares'
		>
			<SettingsMiddleware />
		</SettingsContainer>
	);
}
