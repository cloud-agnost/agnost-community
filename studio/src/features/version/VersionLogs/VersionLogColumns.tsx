import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Clock, Calendar, Files } from '@phosphor-icons/react';
import { BADGE_COLOR_MAP } from '@/constants';
import useVersionStore from '@/store/version/versionStore';
import { ColumnDefWithClassName, VersionLog } from '@/types';
import { capitalize, translate } from '@/utils';
import { DateTime } from 'luxon';
const { openVersionLogDetails } = useVersionStore.getState();
export const VersionLogColumns: ColumnDefWithClassName<VersionLog>[] = [
	{
		id: 'timestamp',
		header: translate('version.timestamp'),
		accessorKey: 'timestamp',
		sortingFn: 'textCaseSensitive',

		cell: ({
			row: {
				original: { timestamp },
			},
		}) => {
			return (
				<div className='flex items-center gap-2'>
					<Calendar size={16} />
					<span className='whitespace-nowrap text-default'>
						{DateTime.fromISO(timestamp)
							.setLocale('en')
							.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}
					</span>
				</div>
			);
		},
	},
	{
		id: 'name',
		header: translate('general.name'),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		size: 300,
	},
	{
		id: 'status',
		header: translate('general.status'),
		accessorKey: 'status',
		sortingFn: 'textCaseSensitive',
		size: 100,
		cell: ({
			row: {
				original: { status },
			},
		}) => {
			return (
				<Badge variant={BADGE_COLOR_MAP[status.toUpperCase()]} text={capitalize(status)} rounded />
			);
		},
	},
	{
		id: 'duration',
		header: translate('version.response_time'),
		accessorKey: 'duration',
		sortingFn: 'textCaseSensitive',
		size: 100,
		cell: ({
			row: {
				original: { duration },
			},
		}) => {
			return (
				<div className='flex items-center gap-2'>
					<Clock size={24} />
					<span className='whitespace-nowrap text-default'>{duration}ms</span>
				</div>
			);
		},
	},
	{
		id: 'action',
		size: 100,
		cell: ({ row: { original } }) => {
			return (
				<Button variant='secondary' onClick={() => openVersionLogDetails(original)}>
					<Files className='mr-2' />
					{translate('version.view_log')}
				</Button>
			);
		},
	},
];
