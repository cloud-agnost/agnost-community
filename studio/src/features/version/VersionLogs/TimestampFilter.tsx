import { Button } from '@/components/Button';
import { useColumnFilter } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { ColumnFilterType, ConditionsType, FieldTypes, Filters } from '@/types';
import { cn, toIsoString } from '@/utils';
import { FunnelSimple } from '@phosphor-icons/react';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { endOfDay, startOfDay } from 'date-fns';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { DateRangePicker, Range, RangeKeyDict } from 'react-date-range';
import { useLocation, useSearchParams } from 'react-router-dom';

export default function TimestampFilter() {
	const { pathname } = useLocation();
	const logType = pathname.split('/')[7];
	const { selectedFilter } = useColumnFilter(logType, 'timestamp', FieldTypes.DATETIME);
	const [searchParams, setSearchParams] = useSearchParams();
	const version = useVersionStore((state) => state.version);
	const updateCurrentTab = useTabStore((state) => state.updateCurrentTab);
	const [date, setDate] = useState<Range[]>([
		{
			startDate: startOfDay(new Date()),
			endDate: endOfDay(new Date()),
			key: 'selection',
		},
	]);
	const { setColumnFilters } = useUtilsStore();

	function selectDate(date: Range[]) {
		const range = [
			{
				startDate: startOfDay(date[0].startDate as Date),
				endDate: endOfDay(date[0].endDate as Date),
				key: 'selection',
			},
		];
		setDate(range);
	}

	function applyFilter() {
		const filter: ColumnFilterType = {
			conditions: [
				{
					filter: startOfDay(date[0].startDate as Date).toISOString(),
					type: ConditionsType.GreaterThanOrEqual,
				},
				{
					filter: endOfDay(date[0].endDate as Date).toISOString(),
					type: ConditionsType.LessThanOrEqual,
				},
			],
			filterType: Filters.Date,
		};
		setColumnFilters('timestamp', filter, logType);

		searchParams.set('start', toIsoString(date[0].startDate as Date) ?? '');
		searchParams.set('end', toIsoString(date[0].endDate as Date) ?? '');
		setSearchParams(searchParams);
		updateCurrentTab(version._id, {
			path: `${pathname}?${searchParams.toString()}`,
		});
	}

	function clearFilter() {
		setDate([
			{
				startDate: startOfDay(new Date()),
				endDate: endOfDay(new Date()),
				key: 'selection',
			},
		]);
		searchParams.set('start', toIsoString(startOfDay(new Date())) ?? '');
		searchParams.set('end', toIsoString(endOfDay(new Date())) ?? '');
		setSearchParams(searchParams);
		updateCurrentTab(version._id, {
			path: `${pathname}?${searchParams.toString()}`,
		});
	}

	useEffect(() => {
		const start = searchParams.get('start');
		const end = searchParams.get('end');
		if (start && end) {
			const range = [
				{
					startDate: new Date(start),
					endDate: new Date(end),
					key: 'selection',
				},
			];
			setDate(range);
		}
	}, [searchParams]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant='icon'
					size='sm'
					rounded
					className={cn(
						!_.isNil(selectedFilter) &&
							'bg-button-primary/90 dark:bg-button-primary/70 hover:bg-brand-darker dark:hover:bg-button-primary !text-white dark:text-default',
					)}
				>
					<FunnelSimple size={14} />
				</Button>
			</PopoverTrigger>
			<PopoverContent align='start' className='bg-wrapper-background-light z=[99]'>
				<DateRangePicker
					onChange={(item: RangeKeyDict) => selectDate([item.selection])}
					moveRangeOnFirstSelection={false}
					months={1}
					ranges={date}
					direction='horizontal'
					className='bg-lighter'
				/>

				<div className='flex items-center justify-end gap-2 border-t border-border p-4'>
					<PopoverClose asChild>
						<Button variant='outline' className='mr-2' size='lg'>
							Cancel
						</Button>
					</PopoverClose>
					<PopoverClose asChild>
						<Button variant='secondary' className='mr-2' size='lg' onClick={clearFilter}>
							Reset Filter
						</Button>
					</PopoverClose>
					<PopoverClose asChild>
						<Button size='lg' onClick={applyFilter}>
							Apply
						</Button>
					</PopoverClose>
				</div>
			</PopoverContent>
		</Popover>
	);
}
