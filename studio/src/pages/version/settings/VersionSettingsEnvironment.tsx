import { DeployButton } from '@/features/version/DeployButton';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { SettingsEnvironment } from '@/features/version/SettingsEnvironment';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { formatDate } from '@/utils';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

export default function VersionSettingsEnvironment() {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);

	return (
		<SettingsContainer
			info={
				environment?.deploymentDtm &&
				`Last deployment at: ${formatDate(environment?.deploymentDtm, DateTime.DATETIME_MED)}`
			}
			pageTitle={t('version.settings.environment')}
			action={<DeployButton />}
		>
			<SettingsEnvironment />
		</SettingsContainer>
	);
}
