import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { HTTP_METHOD_BADGE_MAP } from '@/constants';
import TestEndpoint from '@/features/endpoints/TestEndpoint';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

export default function EditEndpoint() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('endpoint.update');
	const { saveEndpointLogic, openEditEndpointDialog, endpoint, logics, setLogics, deleteLogic } =
		useEndpointStore();

	const [searchParams, setSearchParams] = useSearchParams();
	const [isTestEndpointOpen, setIsTestEndpointOpen] = useState(false);
	const { versionId, appId, orgId, endpointId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		endpointId: string;
	}>();

	const { mutateAsync: saveEpMutation, isPending } = useMutation({
		mutationFn: saveEndpointLogic,
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('endpoint.editLogicSuccess'),
				type: 'success',
			});
		},
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});

	function saveLogic(logic: string) {
		saveEpMutation({
			orgId: orgId,
			appId: appId,
			versionId: versionId,
			epId: endpointId,
			logic: logic,
		});
	}

	return (
		<VersionEditorLayout
			onEditModalOpen={() => openEditEndpointDialog(endpoint)}
			onTestModalOpen={() => setIsTestEndpointOpen(true)}
			onSaveLogic={saveLogic}
			loading={isPending}
			name={endpoint?._id}
			canEdit={canEdit}
			logic={logics[endpoint._id]}
			setLogic={(val) => setLogics(endpoint._id, val)}
			deleteLogic={() => deleteLogic(endpoint._id)}
			breadCrumbItems={[
				{
					name: t('endpoint.title').toString(),
					url: `/organization/${orgId}/apps/${appId}/version/${versionId}/endpoint`,
				},
				{
					name: endpoint?.name,
				},
			]}
		>
			<div className='flex items-center flex-1'>
				<div className='border border-input-disabled-border rounded-l w-16 h-9'>
					<Badge
						className='w-full h-full rounded-l rounded-r-none'
						variant={HTTP_METHOD_BADGE_MAP[endpoint.method]}
						text={endpoint.method}
					/>
				</div>
				<Input className='rounded-none rounded-r max-w-5xl' value={endpoint.path} disabled />
			</div>
			<TestEndpoint
				open={isTestEndpointOpen}
				onClose={() => {
					setIsTestEndpointOpen(false);
					searchParams.delete('t');
					setSearchParams(searchParams);
				}}
			/>
		</VersionEditorLayout>
	);
}
