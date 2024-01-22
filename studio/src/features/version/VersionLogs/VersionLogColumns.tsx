import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Clock, Calendar, Files } from '@phosphor-icons/react';
import { BADGE_COLOR_MAP, BASE_URL, HTTP_METHOD_BADGE_MAP } from '@/constants';
import useVersionStore from '@/store/version/versionStore';
import { ColumnDefWithClassName, VersionLog } from '@/types';
import { DATETIME_MED_WITH_SECONDS, capitalize, translate, formatDate } from '@/utils';
import { CopyButton } from '@/components/CopyButton';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { SortButton } from '@/components/DataTable';

const { openVersionLogDetails } = useVersionStore.getState();
const env = useEnvironmentStore.getState().environment;
export const VersionLogColumns: ColumnDefWithClassName<VersionLog>[] = [
	{
		id: 'timestamp',
		header: () => <SortButton text={translate('version.timestamp')} field='timestamp' />,
		accessorKey: 'timestamp',
		cell: ({
			row: {
				original: { timestamp },
			},
		}) => {
			return (
				<div className='flex items-center gap-2'>
					<Calendar size={16} />
					<span className='whitespace-nowrap text-default'>
						{formatDate(timestamp, DATETIME_MED_WITH_SECONDS)}
					</span>
				</div>
			);
		},
	},
	{
		id: 'name',
		header: () => <SortButton text={translate('general.name')} field='name' />,
		accessorKey: 'name',
		size: 100,
	},
	{
		id: 'method',
		header: () => <SortButton text={translate('endpoint.method')} field='method' />,
		accessorKey: 'method',
		size: 100,
		cell: ({ row }) => {
			const { method } = row.original;
			return (
				<Badge variant={HTTP_METHOD_BADGE_MAP[method]} text={method} className='min-w-[52px]' />
			);
		},
	},
	{
		id: 'path',
		header: () => <SortButton text={translate('endpoint.path')} field='path' />,
		accessorKey: 'path',
		size: 300,
		cell: ({ row }) => {
			const { path } = row.original;
			const copyText = `${BASE_URL}/${env?.iid}${path}`;
			return (
				<div className='flex items-center gap-8 group'>
					<div className='truncate font-mono'>{path}</div>
					<CopyButton text={copyText} className='hidden group-hover:block' />
				</div>
			);
		},
	},
	{
		id: 'status',
		header: () => <SortButton text={translate('general.status')} field='status' />,
		accessorKey: 'status',
		size: 100,
		cell: ({
			row: {
				original: { status },
			},
		}) => {
			let statusText = status;
			if (typeof status !== 'string') {
				statusText = status >= 200 && status < 400 ? 'success' : 'error';
			}
			return (
				<Badge
					variant={BADGE_COLOR_MAP[statusText.toUpperCase()]}
					text={capitalize(statusText)}
					rounded
				/>
			);
		},
	},
	{
		id: 'duration',
		header: () => <SortButton text={translate('version.response_time')} field='duration' />,
		accessorKey: 'duration',
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
