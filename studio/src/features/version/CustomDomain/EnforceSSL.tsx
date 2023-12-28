import { SettingsFormItem } from '@/components/SettingsFormItem';
import { Switch } from '@/components/Switch';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks';
import useClusterStore from '@/store/cluster/clusterStore';
import { useTranslation } from 'react-i18next';
export default function EnforceSSL() {
	const { notify } = useToast();
	const { t } = useTranslation();
	const { cluster, enforceSSL } = useClusterStore();
	const { mutate: enforceSSLMutation } = useMutation({
		mutationFn: enforceSSL,
		onSuccess: () => {
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('cluster.enforce_https_success'),
			});
		},
		onError: (error) => {
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		},
	});
	return (
		<SettingsFormItem
			className='space-y-0 py-0 pb-6'
			contentClassName='pt-6'
			title={t('cluster.enforce_https')}
			description={t('cluster.enforce_https_description')}
			twoColumns
		>
			<Switch
				disabled={!cluster?.domains.length}
				checked={cluster?.enforceSSLAccess}
				onCheckedChange={(enforceSSLAccess) => enforceSSLMutation({ enforceSSLAccess })}
			/>
		</SettingsFormItem>
	);
}
