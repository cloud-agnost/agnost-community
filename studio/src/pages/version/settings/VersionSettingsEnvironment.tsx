import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useTranslation } from 'react-i18next';
import { SettingsEnvironment } from '@/features/version/SettingsEnvironment';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { formatDate } from '@/utils';
import { DateTime } from 'luxon';
import { DeployButton } from '@/features/version/DeployButton';

export default function VersionSettingsEnvironment() {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);
	return (
		<SettingsContainer
			info={
				environment?.deploymentDtm &&
				`Last deployment at: ${formatDate(
					environment?.deploymentDtm as string,
					DateTime.DATETIME_MED,
				)}`
			}
			pageTitle={t('version.settings.environment')}
			action={<DeployButton />}
		>
			<SettingsEnvironment />
		</SettingsContainer>
	);
}
