import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Input } from '@/components/Input';
import { Pencil } from '@/components/icons';
import { BADGE_COLOR_MAP } from '@/constants';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { Endpoint } from '@/types';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	LoaderFunctionArgs,
	useLoaderData,
	useOutletContext,
	useParams,
	useSearchParams,
} from 'react-router-dom';
import { useToast } from '@/hooks';
import TestEndpoint from '@/features/endpoints/TestEndpoint';

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
		<div className='p-4 space-y-6 h-full'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center flex-1'>
					<div className='border border-input-disabled-border rounded-l w-16 h-9'>
						<Badge
							className='w-full h-full rounded-l rounded-r-none'
							variant={BADGE_COLOR_MAP[endpoint.method]}
							text={endpoint.method}
						/>
					</div>
					<Input className='rounded-none rounded-r max-w-5xl' value={endpoint.path} disabled />
				</div>
				<div className='space-x-4'>
					<Button
						variant='secondary'
						iconOnly
						onClick={() => {
							setIsEditEndpointOpen(true);
						}}
					>
						<Pencil className='text-icon-base w-5 h-5' />
					</Button>
					<Button
						variant='secondary'
						onClick={() => {
							setIsTestEndpointOpen(true);
							setSearchParams({ t: 'params' });
						}}
					>
						<TestTube size={20} className='text-icon-base mr-2' />
						{t('endpoint.test.test')}
					</Button>
					<Button variant='primary' onClick={saveLogic} loading={loading}>
						<FloppyDisk size={20} className='text-icon-secondary mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>

			<CodeEditor containerClassName='h-[95%]' value={endpoint.logic} onChange={setEndpointLogic} />
			<TestEndpoint
				open={isTestEndpointOpen}
				onClose={() => {
					setIsTestEndpointOpen(false);
					searchParams.delete('t');
					setSearchParams(searchParams);
				}}
			/>
		</div>
	);
}
