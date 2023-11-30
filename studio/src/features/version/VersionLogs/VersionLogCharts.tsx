import useThemeStore from '@/store/theme/themeStore';
import useVersionStore from '@/store/version/versionStore';
import { DATE_FORMAT, DATE_TIME_FORMAT, toIsoString, formatDate } from '@/utils';
import { t } from 'i18next';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { Range } from 'react-date-range';
import { useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { CustomTooltip } from './VersionLogs';

interface VersionLogChartsProps {
	date: Range[];
	setDate: Dispatch<SetStateAction<Range[]>>;
}

export default function VersionLogCharts({ date, setDate }: VersionLogChartsProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const handleClickChart = (e: CategoricalChartState) => {
		if (e?.activeLabel && e?.activeTooltipIndex !== undefined) {
			const currentData = data[e.activeTooltipIndex];
			if (currentData?.success) {
				setDate([
					{
						startDate: new Date(currentData.start),
						endDate: new Date(currentData.end),
						key: 'selection',
					},
				]);
				setSearchParams({
					...searchParams,
					start: toIsoString(new Date(currentData.start)),
					end: toIsoString(new Date(currentData.end)),
				});
			}
		}
	};

	const { theme } = useThemeStore();
	const { logBuckets } = useVersionStore();
	const data = useMemo(
		() =>
			logBuckets?.buckets?.map?.((item) => ({
				name: `${formatDate(item.start, DATE_FORMAT)} - ${formatDate(item.end, DATE_FORMAT)}`,
				start: formatDate(item.start, DATE_FORMAT),
				end: formatDate(item.end, DATE_FORMAT),
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
					{formatDate(date[0].startDate as Date, DATE_TIME_FORMAT)} to{' '}
					{formatDate(date[0].endDate as Date, DATE_TIME_FORMAT)}
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
