import { EmptyState } from '@/components/EmptyState';
import { VersionLogDetails } from '@/features/version/VersionLogs';
import useVersionStore from '@/store/version/versionStore';
import { calculateRecommendedBuckets, toIsoString } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { endOfDay, startOfDay } from 'date-fns';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
import VersionLogCharts from './VersionLogCharts';
import VersionLogsTable from './VersionLogsTable';
import _ from 'lodash';
interface VersionLogsProps {
	type: 'queue' | 'task' | 'endpoint';
}
export default function VersionLogs({ type }: VersionLogsProps) {
	const { t } = useTranslation();
	const { getVersionLogBuckets, showLogDetails, closeVersionLogDetails, logBuckets } =
		useVersionStore();
	const { appId, orgId, versionId } = useParams<{
		appId: string;
		orgId: string;
		versionId: string;
	}>();

	const [searchParams, setSearchParams] = useSearchParams();

	const { refetch, isFetching } = useQuery({
		queryKey: ['versionLogBuckets'],
		queryFn: () => {
			const start = new Date(searchParams.get('start') as string);
			const end = new Date(searchParams.get('end') as string);
			return getVersionLogBuckets({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
				type,
				start: searchParams.get('start') ?? '',
				end: searchParams.get('end') ?? '',
				buckets: calculateRecommendedBuckets(start, end as Date),
			});
		},
		enabled: !_.isNil(searchParams.get('start')) && !_.isNil(searchParams.get('end')),
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!_.isNil(searchParams.get('start')) && !_.isNil(searchParams.get('end'))) refetch();
	}, [searchParams]);

	useEffect(() => {
		const start = searchParams.get('start');
		const end = searchParams.get('end');
		if (!start || !end) {
			searchParams.set('start', toIsoString(startOfDay(new Date())) ?? '');
			searchParams.set('end', toIsoString(endOfDay(new Date())) ?? '');
			setSearchParams(searchParams);
		}
	}, []);

	return (
		<div className='h-full space-y-6'>
			<VersionLogCharts />
			{isFetching ? (
				<div className='flex items-center justify-center h-full w-full'>
					<BeatLoader color='#6884FD' size={16} margin={12} />
				</div>
			) : logBuckets.totalHits > 0 ? (
				<>
					<VersionLogsTable type={type} />
					<VersionLogDetails open={showLogDetails} onClose={closeVersionLogDetails} />
				</>
			) : (
				<div className='flex flex-col h-1/2 items-center justify-center'>
					<EmptyState type={type} title={t('version.no_logs')} />
				</div>
			)}
		</div>
	);
}
export const CustomTooltip = ({ payload }: any) => {
	const { t } = useTranslation();
	return (
		<div className='bg-subtle p-2 rounded-lg space-y-4 max-w-[13rem]'>
			<p className='text-subtle text-sm font-sfCompact'>{payload?.[0]?.payload.tooltip}</p>
			<p className='text-default text-sm font-sfCompact flex items-center gap-1'>
				<span className='bg-[#11BB69] w-3 h-3 rounded inline-block mr-1' />
				{payload?.[0]?.payload?.success}{' '}
				<span className='text-subtle'>{t('version.success_count')}</span>
			</p>
			<p className='text-default text-sm font-sfCompact flex items-center gap-1'>
				<span className='bg-[#EE446D] w-3 h-3 rounded inline-block mr-1' />
				{payload?.[0]?.payload?.error} <span className='text-subtle'> {t('version.errors')}</span>
			</p>
		</div>
	);
};
