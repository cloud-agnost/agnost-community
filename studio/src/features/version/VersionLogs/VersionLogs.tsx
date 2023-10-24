import { DataTable } from '@/components/DataTable';
import { DateRangePicker } from '@/components/DateRangePicker';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { VersionLogColumns, VersionLogDetails } from '@/features/version/VersionLogs';
import useVersionStore from '@/store/version/versionStore';
import { calculateRecommendedBuckets, convertDateToMilliseconds, formatDate } from '@/utils';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Range } from 'react-date-range';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';

interface VersionLogsProps {
	type: 'queue' | 'task' | 'endpoint';
}
export default function VersionLogs({ type }: VersionLogsProps) {
	const { t } = useTranslation();
	const {
		logs,
		logBuckets,
		lastFetchedLogCount,
		getVersionLogs,
		getVersionLogBuckets,
		showLogDetails,
		closeVersionLogDetails,
	} = useVersionStore();
	const { appId, orgId, versionId } = useParams<{
		appId: string;
		orgId: string;
		versionId: string;
	}>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [date, setDate] = useState<Range[]>([
		{
			startDate: new Date(),
			endDate: DateTime.now().plus({ days: 1 }).toJSDate(),
			key: 'selection',
		},
	]);
	const [page, setPage] = useState(0);

	const handleClickChart = (e: CategoricalChartState) => {
		if (e?.activeLabel && e?.activeTooltipIndex !== undefined) {
			const previousData = data[e.activeTooltipIndex - 1];
			const currentData = data[e.activeTooltipIndex];
			const nextData = data[e.activeTooltipIndex + 1];
			const currentDateTime = convertDateToMilliseconds(currentData?.name);

			let timeDiff;
			if (nextData) {
				timeDiff = convertDateToMilliseconds(nextData.name) - currentDateTime;
			} else if (previousData) {
				timeDiff = currentDateTime - convertDateToMilliseconds(previousData.name);
			}

			if (timeDiff && (!!currentData?.success || !!currentData?.error)) {
				const start = currentDateTime;
				const end = currentDateTime + timeDiff;
				setDate([
					{
						startDate: new Date(start),
						endDate: new Date(end),
						key: 'selection',
					},
				]);
				setPage(0);
				setSearchParams({
					...searchParams,
					start: new Date(start).toISOString(),
					end: new Date(end).toISOString(),
				});
			}
		}
	};
	const data = useMemo(
		() =>
			logBuckets?.buckets?.map?.((item) => ({
				name: formatDate(item.start, DateTime.DATETIME_SHORT),
				success: item.success,
				error: item?.error,
			})) ?? [],
		[logBuckets],
	);

	useEffect(() => {
		getVersionLogBuckets({
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
			type,
			start: searchParams.get('start') ?? date[0].startDate?.toISOString() ?? '',
			end: searchParams.get('end') ?? date[0].endDate?.toISOString() ?? '',
			buckets: calculateRecommendedBuckets(date[0].startDate as Date, date[0].endDate as Date),
		});
	}, [searchParams]);

	useEffect(() => {
		getVersionLogs({
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
			type,
			start: searchParams.get('start') ?? date[0].startDate?.toISOString(),
			end: searchParams.get('end') ?? date[0].endDate?.toISOString(),
			page,
			size: PAGE_SIZE,
		});
	}, [searchParams, page]);
	return (
		<div className='max-h-full space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold text-default'>{t('version.log')}</h1>
				<DateRangePicker
					date={date}
					onChange={(date) => {
						setDate(date);
						setPage(0);
						setSearchParams({
							...searchParams,
							start: date[0].startDate?.toISOString(),
							end: date[0].endDate?.toISOString(),
						});
					}}
				/>
			</div>
			<div className=' max-h-[400px] border border-border rounded-lg'>
				<div className=' bg-subtle w-full rounded-t-lg p-4'>
					<h1 className='font-semibold text-default space-x-2'>
						<span>{logBuckets?.totalHits}</span>
						<span>{logBuckets?.totalHits <= 1 ? t('version.hit') : t('version.hits')}</span>
					</h1>
					<p className='text-sm text-subtle'>
						{formatDate(date[0].startDate as Date, DateTime.DATETIME_SHORT_WITH_SECONDS)} to{' '}
						{formatDate(date[0].endDate as Date, DateTime.DATETIME_SHORT_WITH_SECONDS)}
					</p>
				</div>
				<div className='p-4 w-full max-h-1/2'>
					<ResponsiveContainer width='100%' height='100%' minHeight={250}>
						<BarChart
							data={data}
							margin={{
								top: 20,
								right: 30,
								left: 0,
								bottom: 5,
							}}
							onClick={handleClickChart}
						>
							<CartesianGrid stroke='#46474E' strokeDasharray='4 4' vertical={false} />
							<XAxis minTickGap={10} dataKey='name' />
							<Tooltip
								content={<CustomTooltip payload={data} />}
								cursor={{
									fill: '#323849',
									radius: 2,
								}}
							/>
							<Bar name='Success Count' dataKey='success' stackId='a' fill='#11BB69' />
							<Bar
								name='Error Count'
								dataKey='error'
								stackId='a'
								fill='#EE446D'
								radius={[4, 4, 0, 0]}
								className='text-default'
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={logs?.length}
				next={() => setPage((prev) => prev + 1)}
				hasMore={lastFetchedLogCount >= PAGE_SIZE}
				loader={<TableLoading />}
			>
				<DataTable columns={VersionLogColumns} data={logs} />
			</InfiniteScroll>
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
				{payload?.[0]?.payload?.error} <span className='text-subtle'> {t('version.error')}</span>
			</p>
		</div>
	);
};
