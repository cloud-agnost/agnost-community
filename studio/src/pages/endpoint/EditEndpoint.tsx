import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { HTTP_METHOD_BADGE_MAP } from '@/constants';
import TestEndpoint from '@/features/endpoints/TestEndpoint';
import { useToast } from '@/hooks';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useOutletContext, useParams, useSearchParams } from 'react-router-dom';

EditEndpoint.loader = async ({ params }: LoaderFunctionArgs) => {
	const { endpointId, orgId, versionId, appId } = params;
	if (!endpointId) return null;

	const endpoint = await useEndpointStore.getState().getEndpointById({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		epId: endpointId as string,
	});

	return { endpoint };
};

export default function EditEndpoint() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { saveEndpointLogic, endpoint } = useEndpointStore();
	const [searchParams, setSearchParams] = useSearchParams();
	const [endpointLogic, setEndpointLogic] = useState<string | undefined>(endpoint?.logic);
	const [isTestEndpointOpen, setIsTestEndpointOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const { setIsEditEndpointOpen } = useOutletContext() as {
		setIsEditEndpointOpen: (isOpen: boolean) => void;
	};

	function saveLogic() {
		setLoading(true);
		saveEndpointLogic({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			epId: endpoint._id,
			logic: endpointLogic as string,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('endpoint.editLogicSuccess'),
					type: 'success',
				});
			},
			onError: ({ error, details }) => {
				setLoading(false);
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}

	return (
		<VersionEditorLayout
			onEditModalOpen={() => setIsEditEndpointOpen(true)}
			onTestModalOpen={() => setIsTestEndpointOpen(true)}
			onSaveLogic={saveLogic}
			loading={loading}
			logic={endpoint?.logic}
			setLogic={setEndpointLogic}
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
