import './SettingsEnvironment.scss';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { useTranslation } from 'react-i18next';
import { Switch } from 'components/Switch';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { Button } from 'components/Button';
import { CopyInput } from 'components/CopyInput';
import { useParams } from 'react-router-dom';
import { cn } from '@/utils';
import { EnvironmentResourcesTable } from '@/features/version/SettingsEnvironment';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

export default function SettingsEnvironment() {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);
	const canEdit = useAuthorizeVersion('version.update');
	const canDeploy = useAuthorizeVersion('version.deploy');
	const { toggleAutoDeploy, suspendEnvironment, activateEnvironment } = useEnvironmentStore();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function onAutoDeployStatusChanged(autoDeploy: boolean) {
		if (!versionId || !appId || !orgId || !environment?._id) return;
		await toggleAutoDeploy({
			envId: environment._id,
			orgId,
			appId,
			versionId,
			autoDeploy,
		});
	}

	async function suspendOrActive() {
		if (!versionId || !appId || !orgId || !environment?._id) return;
		const func = environment?.suspended ? activateEnvironment : suspendEnvironment;
		await func({
			envId: environment._id,
			orgId,
			appId,
			versionId,
		});
	}

	return (
		<div className='divide-y'>
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
			<SettingsFormItem
				className='space-y-0 py-6'
				contentClassName='pt-6'
				title={t('version.environment_id')}
				description={t('version.environment_id_desc')}
			>
				<CopyInput value={environment?.iid} readOnly />
			</SettingsFormItem>
			<SettingsFormItem
				className='space-y-0 py-6'
				contentClassName='pt-6'
				title={
					environment?.suspended ? t('version.reactivate_services') : t('version.suspend_services')
				}
				description={
					environment?.suspended
						? t('version.reactivate_services_desc')
						: t('version.suspend_services_desc')
				}
			>
				<Button
					disabled={!canEdit}
					className={cn(!environment?.suspended && '!text-elements-red')}
					variant={environment?.suspended ? 'primary' : 'outline'}
					onClick={suspendOrActive}
				>
					{environment?.suspended ? t('version.reactivate') : t('version.suspend')}
				</Button>
			</SettingsFormItem>
			<SettingsFormItem
				className='space-y-0 py-6 max-w-full w-full'
				contentClassName='pt-6'
				title={t('version.resources')}
			>
				<EnvironmentResourcesTable />
			</SettingsFormItem>
		</div>
	);
}
