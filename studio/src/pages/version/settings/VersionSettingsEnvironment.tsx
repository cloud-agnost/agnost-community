import { DeployButton } from '@/features/version/DeployButton';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { AutoDeploy } from '@/features/version/SettingsEnvironment';
import EnvironmentId from '@/features/version/SettingsEnvironment/EnvironmentId';
import EnvironmentStatusToggle from '@/features/version/SettingsEnvironment/EnvironmentStatusToggle';
import UpdateAPIServer from '@/features/version/SettingsEnvironment/UpdateAPIServer';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { useTranslation } from 'react-i18next';
import { DATETIME_MED, formatDate } from '@/utils';

export default function VersionSettingsEnvironment() {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);

	return (
		<SettingsContainer
			info={
				environment?.deploymentDtm &&
				`Last deployment at: ${formatDate(environment?.deploymentDtm, DATETIME_MED)}`
			}
			pageTitle={t('version.settings.environment')}
			action={<DeployButton />}
		>
			<div className='divide-y'>
				<AutoDeploy />
				<EnvironmentId />
				<UpdateAPIServer />
				<EnvironmentStatusToggle />
			</div>
		</SettingsContainer>
	);
}
