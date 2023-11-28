import { SettingsFormItem } from '@/components/SettingsFormItem';
import { useAuthorizeVersion } from '@/hooks';
import { Switch } from '@/components/Switch';
import { useTranslation } from 'react-i18next';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { useParams } from 'react-router-dom';
export default function AutoDeploy() {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);
	const canDeploy = useAuthorizeVersion('env.deploy');
	const { toggleAutoDeploy } = useEnvironmentStore();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function onAutoDeployStatusChanged(autoDeploy: boolean) {
		if (!versionId || !appId || !orgId || !environment?._id) return;
		toggleAutoDeploy({
			envId: environment._id,
			orgId,
			appId,
			versionId,
			autoDeploy,
		});
	}
	return (
		<SettingsFormItem
			className='space-y-0 pb-6 pt-0'
			contentClassName='flex items-center justify-end'
			twoColumns
			title={t('version.auto_deploy')}
			description={t('version.auto_redeploy_desc')}
		>
			<Switch
				disabled={!canDeploy}
				checked={!!environment?.autoDeploy}
				onCheckedChange={onAutoDeployStatusChanged}
			/>
		</SettingsFormItem>
	);
}
