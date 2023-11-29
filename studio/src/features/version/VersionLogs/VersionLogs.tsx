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
interface VersionLogsProps {
	type: 'queue' | 'task' | 'endpoint';
}
export default function VersionLogs({ type }: VersionLogsProps) {
	const { t } = useTranslation();
	const { getVersionLogBuckets, showLogDetails, closeVersionLogDetails } = useVersionStore();
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

	const { refetch } = useQuery({
		queryKey: ['versionLogBuckets'],
		queryFn: () =>
			getVersionLogBuckets({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
				type,
				start: searchParams.get('start') ?? toIsoString(date[0].startDate as Date) ?? '',
				end: searchParams.get('end') ?? toIsoString(date[0].endDate as Date) ?? '',
				buckets: calculateRecommendedBuckets(date[0].startDate as Date, date[0].endDate as Date),
			}),
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		refetch();
	}, [searchParams]);

	return (
		<div className='max-h-full space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold text-default'>{t('version.log')}</h1>
				<DateRangePicker date={date} onChange={selectDate} />
			</div>
			<VersionLogCharts date={date} setDate={setDate} />
			<VersionLogsTable date={date} type={type} />
			<VersionLogDetails open={showLogDetails} onClose={closeVersionLogDetails} />
		</div>
	);
}
export const CustomTooltip = ({ payload }: any) => {
	const { t } = useTranslation();
	return (
		<div className='bg-subtle p-2 rounded-lg space-y-4'>
			<p className='text-subtle text-sm font-sfCompact'>{payload?.[0]?.payload.name}</p>
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
