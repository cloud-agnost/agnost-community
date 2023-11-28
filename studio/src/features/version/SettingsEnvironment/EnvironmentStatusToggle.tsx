import { Button } from '@/components/Button';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { useAuthorizeVersion } from '@/hooks';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { cn } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function EnvironmentStatusToggle() {
	const { t } = useTranslation();
	const environment = useEnvironmentStore((state) => state.environment);
	const canEdit = useAuthorizeVersion('env.update');
	const { suspendEnvironment, activateEnvironment } = useEnvironmentStore();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function suspendOrActive() {
		if (!versionId || !appId || !orgId || !environment?._id) return;
		const func = environment?.suspended ? activateEnvironment : suspendEnvironment;
		func({
			envId: environment._id,
			orgId,
			appId,
			versionId,
		});
	}

	return (
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
	);
}
