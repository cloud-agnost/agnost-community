import { useToast } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { APIError, VersionProperties } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';

interface UpdateVersionReturnType {
	updateVersion: (data: Partial<VersionProperties>) => void;
	isPending: boolean;
	error: APIError | null;
}
export default function useUpdateVersion(): UpdateVersionReturnType {
	const { updateVersionProperties } = useVersionStore();
	const params = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();

	const { mutateAsync, ...result } = useMutation({
		mutationFn: updateVersionProperties,
		onError: (error: APIError) => {
			notify({
				type: 'error',
				title: t('general.error'),
				description: error.details,
			});
		},
	});
	async function updateVersion(data: Partial<VersionProperties>) {
		const { orgId, versionId, appId } = params;
		if (!orgId || !versionId || !appId) return;

		mutateAsync({
			orgId,
			versionId,
			appId,
			...data,
		});
	}

	return { updateVersion, ...result };
}
