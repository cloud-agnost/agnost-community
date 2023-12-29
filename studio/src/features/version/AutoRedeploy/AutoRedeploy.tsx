import { Switch } from '@/components/Switch';
import { useAuthorizeVersion, useToast } from '@/hooks';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
export default function AutoRedeploy() {
	const { toast } = useToast();
	const { toggleAutoDeploy, environment } = useEnvironmentStore();
	const canDeploy = useAuthorizeVersion('env.deploy');
	const { mutateAsync: toggleAutoDeployMutate } = useMutation({
		mutationFn: toggleAutoDeploy,
		onError: (error: APIError) => {
			toast({
				action: 'error',
				title: error.details,
			});
		},
	});

	async function onAutoDeployStatusChanged(autoDeploy: boolean) {
		if (!environment?._id) return;
		toggleAutoDeployMutate({
			envId: environment._id,
			autoDeploy,
		});
	}
	return (
		<Switch
			checked={!!environment?.autoDeploy}
			onCheckedChange={onAutoDeployStatusChanged}
			disabled={!canDeploy}
		/>
	);
}
