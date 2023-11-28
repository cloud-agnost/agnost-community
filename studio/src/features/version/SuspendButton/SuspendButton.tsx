import { cn, notify } from '@/utils';
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { useAuthorizeVersion } from '@/hooks';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { APIError } from '@/types';
export default function SuspendButton() {
	const { t } = useTranslation();
	const canEdit = useAuthorizeVersion('env.update');
	const { suspendEnvironment, activateEnvironment, environment } = useEnvironmentStore();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const { mutateAsync: suspendOrActiveMutate, isPending } = useMutation({
		mutationFn: environment?.suspended ? activateEnvironment : suspendEnvironment,
		onError: (error: APIError) => {
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		},
	});

	async function suspendOrActive() {
		if (!versionId || !appId || !orgId || !environment?._id) return;
		suspendOrActiveMutate({
			envId: environment._id,
			orgId,
			appId,
			versionId,
		});
	}
	return (
		<Button
			disabled={!canEdit}
			className={cn(!environment?.suspended && '!text-elements-red')}
			variant={environment?.suspended ? 'primary' : 'outline'}
			onClick={suspendOrActive}
			loading={isPending}
		>
			{environment?.suspended ? t('version.reactivate') : t('version.suspend')}
		</Button>
	);
}
