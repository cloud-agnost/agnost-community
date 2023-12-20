import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DateText } from '@/components/DateText';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { Separator } from '@/components/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { Document, Refresh } from '@/components/icons';
import { BADGE_COLOR_MAP, ENV_STATUS_CLASS_MAP } from '@/constants';
import useClusterStore from '@/store/cluster/clusterStore';
import { APIError, EnvironmentStatus } from '@/types';
import { cn } from '@/utils';
import { CircleWavyCheck, Package } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks';
import useAuthStore from '@/store/auth/authStore';

export default function ReleaseDropdown() {
	const { t } = useTranslation();
	const user = useAuthStore((state) => state.user);
	const { getClusterAndReleaseInfo, clusterReleaseInfo, updateClusterRelease } = useClusterStore();
	const classes = ENV_STATUS_CLASS_MAP[getReleaseStatus() as EnvironmentStatus];
	const [selectedTab, setSelectedTab] = useState<string>('release');
	const { notify } = useToast();

	useQuery({
		queryFn: getClusterAndReleaseInfo,
		queryKey: ['getClusterAndReleaseInfo'],
		refetchOnWindowFocus: false,
	});

	const { isPending, mutateAsync } = useMutation({
		mutationFn: () =>
			updateClusterRelease({ release: clusterReleaseInfo?.latest?.release as string }),
		mutationKey: ['updateClusterRelease'],
		onSuccess: () => {
			notify({
				title: t('general.success') as string,
				description: t('cluster.deploy_success') as string,
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

	function getReleaseStatus(): string {
		if (clusterReleaseInfo?.cluster?.clusterResourceStatus.some((item) => item.status === 'Error'))
			return 'Error';
		if (
			clusterReleaseInfo?.cluster?.clusterResourceStatus.some((item) => item.status === 'Deploying')
		)
			return 'Deploying';
		return 'OK';
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='blank' iconOnly className='relative'>
					<div className='absolute top-1 right-0.5'>
						<span className='relative flex items-center justify-center h-3 w-3'>
							<span
								className={cn(
									'animate-ping absolute inline-flex h-full w-full rounded-full ',
									classes?.[0],
								)}
							/>
							<span className={cn('relative inline-flex rounded-full h-2 w-2', classes?.[1])} />
						</span>
					</div>
					<Package size={24} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='relative w-[23rem] bg-wrapper-background-base' align='end'>
				<Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
					<TabsList className='flex-[0.9]' containerClassName='!justify-center !py-4'>
						<TabsTrigger className='flex-[0.9]' value='release'>
							{t('cluster.release')}
						</TabsTrigger>
						<TabsTrigger className='flex-[0.9]' value='history'>
							{t('cluster.history')}
						</TabsTrigger>
					</TabsList>

					<TabsContent className='h-[300px] w-full' value='release'>
						<ReleaseInfo />
					</TabsContent>
					<TabsContent className='h-[300px]' value='history'>
						<ReleaseHistory />
					</TabsContent>
				</Tabs>

				<Separator />

				<div className='p-4 space-y-2'>
					{clusterReleaseInfo?.latest?.release === clusterReleaseInfo?.current?.release ? (
						<div className='text-sm font-sfCompact font-normal leading-6 text-success-default flex items-center gap-2'>
							<CircleWavyCheck />
							<span>{t('cluster.upToDate')}</span>
						</div>
					) : (
						<Button
							variant='text'
							className='!pl-0'
							onClick={mutateAsync}
							disabled={!user?.isClusterOwner}
						>
							<Refresh className={cn('mr-2', isPending && 'animate-spin')} />
							{t('cluster.update', {
								release: clusterReleaseInfo?.latest?.release,
							})}
						</Button>
					)}

					<Link
						className='flex items-center text-sm font-sfCompact hover:underline hover:text-blue-500'
						to={`https://github.com/cloud-agnost/agnost-community/releases/tag/${clusterReleaseInfo?.current?.release}`}
						rel='noopener noreferrer'
						target='_blank'
					>
						<Document className='mr-2' />
						{t('cluster.view_notes')}
					</Link>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function ReleaseInfo() {
	const { t } = useTranslation();
	const { clusterReleaseInfo } = useClusterStore();
	function getReleaseStatus(module: string): string {
		return clusterReleaseInfo?.cluster.clusterResourceStatus.find((item) =>
			item.name.includes(module),
		)?.status as string;
	}
	return (
		<div className='w-full space-y-4 p-4 h-full overflow-auto'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('cluster.component')}</p>
				<p>{t('cluster.status')}</p>
				<p>{t('cluster.current')}</p>
				<p>{t('cluster.latest')}</p>
			</div>
			<Separator />
			<div className='space-y-4'>
				{Object.entries(clusterReleaseInfo?.current?.modules ?? {}).map(
					([module, version]: [string, string]) => (
						<div
							key={module}
							className='text-sm font-sfCompact font-normal leading-6 text-default grid justify-between grid-cols-[2fr_1fr_1fr_1fr] gap-4'
						>
							<p>{module}</p>
							<Badge
								rounded
								variant={BADGE_COLOR_MAP[getReleaseStatus(module)]}
								text={getReleaseStatus(module)}
							/>
							<p className='text-center'>{version}</p>
							<p className='text-end'>
								{
									clusterReleaseInfo?.latest.modules[
										module as keyof typeof clusterReleaseInfo.latest.modules
									]
								}
							</p>
						</div>
					),
				)}
			</div>
		</div>
	);
}
function ReleaseHistory() {
	const { t } = useTranslation();
	const { clusterReleaseInfo } = useClusterStore();
	return (
		<div className='w-full space-y-4 p-4 h-full overflow-auto'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('cluster.release')}</p>
				<p>{t('cluster.deployed_at')}</p>
			</div>
			<Separator />
			<div className='space-y-4'>
				{clusterReleaseInfo?.cluster?.releaseHistory.map((history) => (
					<div
						key={history._id}
						className='text-sm font-sfCompact font-normal leading-6 text-default flex justify-between items-center gap-4'
					>
						<p>{history.release}</p>

						<p className='text-end'>
							<DateText date={history.timestamp} />
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
