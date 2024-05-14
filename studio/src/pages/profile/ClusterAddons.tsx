import { Button } from '@/components/Button';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { useToast } from '@/hooks';
import useClusterStore from '@/store/cluster/clusterStore';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
export default function ClusterAddons() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const { cluster, enabledCICD, disabledCICD } = useClusterStore();

	const { isPending, mutate } = useMutation({
		mutationFn: () => {
			if (cluster.cicdEnabled) {
				return disabledCICD();
			} else {
				return enabledCICD();
			}
		},
		onSuccess: () => {
			toast({
				title: t(`cluster.${cluster.cicdEnabled ? 'gitOpsEnabled' : 'gitOpsDisabled'}`) as string,
				action: 'success',
			});
		},
		onError: (error) => {
			toast({
				title: error.details,
				action: 'error',
			});
		},
	});
	return (
		<SettingsFormItem
			className='space-y-0 py-0 pb-6'
			contentClassName='pt-6'
			title={t('cluster.gitOps')}
			description={t('cluster.gitOpsDescription')}
		>
			<Button
				variant={!cluster.cicdEnabled ? 'primary' : 'destructive'}
				onClick={mutate}
				loading={isPending}
			>
				{!cluster.cicdEnabled ? t('cluster.activate') : t('cluster.deactivate')}
			</Button>
		</SettingsFormItem>
	);
}
