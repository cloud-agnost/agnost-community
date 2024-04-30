import { VersionLogDetails } from '@/features/version/VersionLogs';
import useVersionStore from '@/store/version/versionStore';
import { calculateRecommendedBuckets, toIsoString } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { endOfDay, startOfDay } from 'date-fns';
import _ from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loading } from '@/components/Loading';
import { useColumnFilter, useInfiniteScroll } from '@/hooks';
import useUtilsStore from '@/store/version/utilsStore';
import { ColumnFilterType, ColumnFilters, ConditionsType, FieldTypes, Filters } from '@/types';
import { mongoQueryConverter } from '@/utils/mongoQueryConverter';
import VersionLogCharts from './VersionLogCharts';
import VersionLogsTable from './VersionLogsTable';
interface VersionLogsProps {
	type: 'queue' | 'task' | 'endpoint';
}
export default function VersionLogs({ type }: VersionLogsProps) {
	const {
		getVersionLogBuckets,
		showLogDetails,
		closeVersionLogDetails,
		logBuckets,
		lastFetchedLogPage,
		logs,
		getVersionLogs,
	} = useVersionStore();
	const { appId, orgId, versionId } = useParams<{
		appId: string;
		orgId: string;
		versionId: string;
	}>();
	const { columnFilters, setColumnFilters } = useUtilsStore();
	const { selectedFilter } = useColumnFilter(type, 'timestamp', FieldTypes.DATE);
	const [searchParams, setSearchParams] = useSearchParams();
	const { refetch, isFetching } = useQuery({
		queryKey: ['versionLogBuckets', appId, orgId, versionId, type, columnFilters?.[type]],
		queryFn: () => {
			const start = new Date(searchParams.get('start') as string);
			const end = new Date(searchParams.get('end') as string);
			return getVersionLogBuckets({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
				type,
				start: selectedFilter?.conditions[0]?.filter as string,
				end: selectedFilter?.conditions[1]?.filter as string,
				buckets: calculateRecommendedBuckets(start, end as Date),
				filter: mongoQueryConverter((columnFilters?.[type] as ColumnFilters) ?? {}),
			});
		},
		enabled: !_.isNil(selectedFilter) && _.isNil(logBuckets),
		refetchOnWindowFocus: false,
	});

	const versionLogResponse = useInfiniteScroll({
		lastFetchedPage: lastFetchedLogPage?.[type],
		queryFn: getVersionLogs,
		dataLength: logs?.[type]?.length ?? 0,
		queryKey: 'versionLogs',
		params: {
			type,
			filter: mongoQueryConverter((columnFilters?.[type] as ColumnFilters) ?? {}),
		},
		enabled: !_.isNil(columnFilters?.[type]),
	});

	useEffect(() => {
		refetchLogs();
	}, [columnFilters]);
	useEffect(() => {
		const start = selectedFilter?.conditions[0]?.filter;
		const end = selectedFilter?.conditions[1]?.filter;
		if (!start || !end) {
			const filter: ColumnFilterType = {
				conditions: [
					{
						filter: toIsoString(startOfDay(new Date())),
						type: ConditionsType.GreaterThanOrEqual,
					},
					{
						filter: toIsoString(endOfDay(new Date())),
						type: ConditionsType.LessThanOrEqual,
					},
				],
				filterType: Filters.Date,
			};
			setColumnFilters('timestamp', filter, type);
		}
		if (!searchParams.has('start') || !searchParams.has('end')) {
			searchParams.set('start', toIsoString(startOfDay(new Date())) ?? '');
			searchParams.set('end', toIsoString(endOfDay(new Date())) ?? '');
			setSearchParams(searchParams);
		}
	}, []);

	function refetchLogs() {
		refetch();
		versionLogResponse.refetch();
	}

	return (
		<div className='h-full space-y-6 p-4 relative'>
			<VersionLogCharts type={type} refetch={refetchLogs} />
			{versionLogResponse.isFetching ? (
				<Loading loading={versionLogResponse.isFetching} />
			) : (
				<>
					<VersionLogsTable type={type} {...versionLogResponse} />
					<VersionLogDetails open={showLogDetails} onClose={closeVersionLogDetails} />
				</>
			)}
		</div>
	);
}
export const CustomTooltip = ({ payload }: any) => {
	const { t } = useTranslation();
	return (
		<div className='bg-subtle p-2 rounded-lg space-y-2 max-w-[13rem]'>
			<p className='text-subtle text-xs font-sfCompact'>{payload?.[0]?.payload.tooltip}</p>
			<p className='text-default text-xs font-sfCompact flex items-center gap-1'>
				<span className='bg-[#11BB69] w-3 h-3 rounded inline-block mr-1' />
				{payload?.[0]?.payload?.success}{' '}
				<span className='text-subtle'>{t('version.success_count')}</span>
			</p>
			<p className='text-default text-xs font-sfCompact flex items-center gap-1'>
				<span className='bg-[#EE446D] w-3 h-3 rounded inline-block mr-1' />
				{payload?.[0]?.payload?.error} <span className='text-subtle'> {t('version.errors')}</span>
			</p>
		</div>
	);
};
