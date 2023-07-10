import { Badge } from 'components/Badge';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/Button';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { useParams } from 'react-router-dom';

const deployment = {
	date: 'Jul 22, 2023',
	time: '03:39 PM',
	statusText: 'Suspended',
};

export default function LastDeployment() {
	const { t } = useTranslation();
	const isSuspended = deployment.statusText === 'Suspended';
	const environment = useEnvironmentStore((state) => state.environment);
	const { activateEnvironment } = useEnvironmentStore();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function reactivateHandler() {
		if (!versionId || !appId || !orgId || !environment?._id) return;

		await activateEnvironment({
			envId: environment._id,
			orgId,
			appId,
			versionId,
		});
	}

	return (
		<div className='w-full space-y-2 p-4'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.last_deployment')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				<div className='py-[9px] space-y-2'>
					<div className='flex justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<AuthUserAvatar size='sm' />
							<div className='flex flex-col'>
								<p className='text-sm font-sfCompact font-normal leading-6 text-default'>
									{deployment.date}
								</p>
								<time className='font-sfCompact text-[11px] leading-[21px] tracking-[0.22px] text-subtle font-normal'>
									{deployment.time}
								</time>
							</div>
						</div>
						<div className='flex items-center'>
							<Badge
								rounded
								variant={BADGE_COLOR_MAP[deployment.statusText]}
								text={deployment.statusText}
							/>
						</div>
					</div>
					{isSuspended && (
						<div className='p-4 bg-wrapper-background-base rounded grid gap-2'>
							<div>
								<p className='text-sm font-sfCompact font-normal leading-6 text-default'>
									{t('version.reactivate_services')}
								</p>
								<span className='text-sm font-sfCompact font-normal leading-6 text-subtle'>
									{t('version.reactivate_services_desc')}
								</span>
							</div>
							<div className='flex justify-end'>
								<Button onClick={reactivateHandler}>{t('version.reactivate')}</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
