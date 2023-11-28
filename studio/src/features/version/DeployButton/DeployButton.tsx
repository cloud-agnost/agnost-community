import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { ButtonProps } from '@/components/Button';

export default function DeployButton(props: Omit<ButtonProps, 'loading' | 'onClick'>) {
	const { t } = useTranslation();
	const redeployAppVersionToEnvironment = useEnvironmentStore(
		(state) => state.redeployAppVersionToEnvironment,
	);
	const [loading, setLoading] = useState(false);
	const environment = useEnvironmentStore((state) => state.environment);
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function redeploy() {
		if (!versionId || !appId || !orgId || !environment) return;
		setLoading(true);
		await redeployAppVersionToEnvironment({
			orgId,
			appId,
			versionId,
			envId: environment._id,
		});
		setLoading(false);
	}

	return (
		<Button onClick={redeploy} loading={loading} {...props}>
			{t('version.redeploy')}
		</Button>
	);
}
