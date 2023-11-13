import useThemeStore from '@/store/theme/themeStore';
import useVersionStore from '@/store/version/versionStore';
import { convertDateToMilliseconds, formatDate } from '@/utils';
import { t } from 'i18next';
import { DateTime } from 'luxon';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { CustomTooltip } from './VersionLogs';
import { Range } from 'react-date-range';
import { useSearchParams } from 'react-router-dom';
interface VersionLogChartsProps {
	date: Range[];
	setDate: Dispatch<SetStateAction<Range[]>>;
}

export default function VersionLogCharts({ date, setDate }: VersionLogChartsProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const handleClickChart = (e: CategoricalChartState) => {
		if (e?.activeLabel && e?.activeTooltipIndex !== undefined) {
			const previousData = data[e.activeTooltipIndex - 1];
			const currentData = data[e.activeTooltipIndex];
			const nextData = data[e.activeTooltipIndex + 1];
			const currentDateTime = convertDateToMilliseconds(currentData?.name.split(',')[0]);
			let timeDiff;
			if (nextData) {
				timeDiff = convertDateToMilliseconds(nextData.name.split(',')[0]) - currentDateTime;
			} else if (previousData) {
				timeDiff = currentDateTime - convertDateToMilliseconds(previousData.name.split(',')[0]);
			}
			if (timeDiff && !!currentData?.success) {
				const start = currentDateTime;
				const end = currentDateTime + timeDiff;
				setDate([
					{
						startDate: new Date(start),
						endDate: new Date(end),
						key: 'selection',
					},
				]);
				setSearchParams({
					...searchParams,
					start: new Date(start).toISOString(),
					end: new Date(end).toISOString(),
				});
			}
		}
	};

	const { theme } = useThemeStore();
	const { logBuckets } = useVersionStore();
	const data = useMemo(
		() =>
			logBuckets?.buckets?.map?.((item) => ({
				name: formatDate(item.start, DateTime.DATETIME_SHORT),
				success: item.success,
				error: item?.error,
			})) ?? [],
		[logBuckets],
	);
	return (
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
								fill: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
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
	);
}
