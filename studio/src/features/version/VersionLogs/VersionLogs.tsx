import { DateRangePicker } from '@/components/DateRangePicker';
import { VersionLogDetails } from '@/features/version/VersionLogs';
import useVersionStore from '@/store/version/versionStore';
import { calculateRecommendedBuckets, toIsoString } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Range } from 'react-date-range';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import VersionLogCharts from './VersionLogCharts';
import VersionLogsTable from './VersionLogsTable';
import { startOfDay, endOfDay } from 'date-fns';
import { EmptyState } from '@/components/EmptyState';
import BeatLoader from 'react-spinners/BeatLoader';
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
	const [date, setDate] = useState<Range[]>([
		{
			startDate: startOfDay(new Date()),
			endDate: endOfDay(new Date()),
			key: 'selection',
		},
	]);

	function selectDate(date: Range[]) {
		setDate(date);
		searchParams.set('start', toIsoString(date[0].startDate as Date) ?? '');
		searchParams.set('end', toIsoString(date[0].endDate as Date) ?? '');
		setSearchParams(searchParams);
	}

	const { refetch, isFetching } = useQuery({
		queryKey: ['versionLogBuckets'],
		queryFn: () => {
			const start = new Date(searchParams.get('start') as string) ?? date[0].startDate;
			const end = new Date(searchParams.get('end') as string) ?? date[0].endDate;
			return getVersionLogBuckets({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
				type,
				start: searchParams.get('start') ?? toIsoString(date[0].startDate as Date) ?? '',
				end: searchParams.get('end') ?? toIsoString(date[0].endDate as Date) ?? '',
				buckets: calculateRecommendedBuckets(start, end as Date),
			});
		},
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		refetch();
		const start = searchParams.get('start');
		const end = searchParams.get('end');
		if (start && end) {
			setDate([
				{
					startDate: new Date(start),
					endDate: new Date(end),
					key: 'selection',
				},
			]);
		}
	}, [searchParams]);

	return (
		<div className='h-full space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold text-default'>{t('version.log')}</h1>
				<DateRangePicker date={date} onChange={selectDate} />
			</div>
			{isFetching ? (
				<div className='flex items-center justify-center h-full w-full'>
					<BeatLoader color='#6884FD' size={16} margin={12} />
				</div>
			) : logBuckets.totalHits > 0 ? (
				<>
					<VersionLogCharts date={date} />
					<VersionLogsTable date={date} type={type} />
					<VersionLogDetails open={showLogDetails} onClose={closeVersionLogDetails} />
				</>
			) : (
				<div className='flex flex-col h-full items-center justify-center'>
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
