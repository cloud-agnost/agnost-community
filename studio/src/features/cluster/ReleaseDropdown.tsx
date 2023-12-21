import { Alert, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import { Separator } from '@/components/Separator';
import { Document, Refresh } from '@/components/icons';
import { CLUSTER_RELEASE_CLASS_MAP } from '@/constants';
import { useTable, useToast } from '@/hooks';
import useAuthStore from '@/store/auth/authStore';
import useClusterStore from '@/store/cluster/clusterStore';
import { APIError } from '@/types';
import { cn } from '@/utils';
import { ClockCounterClockwise, Package } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ReleaseColumns from './ReleaseColumns';

export default function ReleaseDropdown() {
	const { t } = useTranslation();
	const { getClusterAndReleaseInfo, clusterReleaseInfo } = useClusterStore();
	const classes = CLUSTER_RELEASE_CLASS_MAP[getReleaseStatus()];

	useQuery({
		queryFn: getClusterAndReleaseInfo,
		queryKey: ['getClusterAndReleaseInfo'],
		refetchOnWindowFocus: false,
	});

	function getReleaseStatus(): string {
		if (clusterReleaseInfo?.cluster?.clusterResourceStatus.some((item) => item.status === 'Error'))
			return 'Error';
		if (
			clusterReleaseInfo?.cluster?.clusterResourceStatus.some((item) => item.status === 'Updating')
		)
			return 'Updating';

		if (clusterReleaseInfo?.latest?.release !== clusterReleaseInfo?.current?.release)
			return 'Has update';
		return 'OK';
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='blank' iconOnly className='relative'>
					{getReleaseStatus() !== 'OK' && (
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
					)}
					<Package size={24} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='relative w-[23rem] bg-wrapper-background-base h-full'
				align='end'
			>
				<DropdownMenuLabel className='text-default flex items-center justify-between p-4'>
					<p>{t('cluster.release_info')}</p>
					<span className='text-subtle text-sm font-sfCompact inline-block text-right'>
						{clusterReleaseInfo?.current?.release}
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<ReleaseInfo />
				<Separator />
				<ReleaseSettings />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ReleaseInfo() {
	const { clusterComponentsReleaseInfo } = useClusterStore();

	const table = useTable({
		columns: ReleaseColumns,
		data: clusterComponentsReleaseInfo,
	});

	return (
		<div className='h-96 overflow-auto'>
			<DataTable
				table={table}
				containerClassName='!border-none'
				className='!bg-transparent [&>tbody]:bg-transparent [&_tr]:border-none [&_td]:p-2 [&_th]:p-2'
			/>
		</div>
	);
}
function ReleaseSettings() {
	const { t } = useTranslation();
	const { clusterReleaseInfo, updateClusterRelease, toggleReleaseHistory } = useClusterStore();
	const user = useAuthStore((state) => state.user);
	const { notify } = useToast();
	const hasUpdate = clusterReleaseInfo?.latest?.release !== clusterReleaseInfo?.current?.release;
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
	return (
		<>
			<Alert variant={hasUpdate ? 'warning' : 'success'} size='sm' className='!rounded-none !gap-4'>
				<AlertTitle className='font-normal'>
					{hasUpdate ? t('cluster.update_available') : t('cluster.up_to_date')}
				</AlertTitle>
			</Alert>

			<DropdownMenuSeparator className='!m-0' />
			<DropdownMenuItemContainer>
				{hasUpdate && (
					<>
						<DropdownMenuItem onClick={mutateAsync} disabled={!user?.isClusterOwner}>
							<Refresh className={cn('mr-2', isPending && 'animate-spin')} />
							{t('cluster.update', {
								release: clusterReleaseInfo?.latest?.release,
							})}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuItem onClick={toggleReleaseHistory}>
					<ClockCounterClockwise className='mr-2' />
					{t('cluster.open_release_history')}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Link
						className='flex items-center gap-1'
						to={`https://github.com/cloud-agnost/agnost-community/releases/tag/${clusterReleaseInfo?.latest?.release}`}
						rel='noopener noreferrer'
						target='_blank'
					>
						<Document className='mr-2' />
						{t('cluster.view_notes')}
					</Link>
				</DropdownMenuItem>
			</DropdownMenuItemContainer>
		</>
	);
}
