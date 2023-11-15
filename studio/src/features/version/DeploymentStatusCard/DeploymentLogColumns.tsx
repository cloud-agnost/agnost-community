import { Button } from '@/components/Button';
import { DateText } from '@/components/DateText';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { ColumnDefWithClassName, EnvLog, SelectedEnvLog } from '@/types';
import { capitalize, translate } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from 'components/Avatar';
import { Badge } from 'components/Badge';
import { Document } from 'components/icons';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { DateTime } from 'luxon';
const DeploymentLogColumns: ColumnDefWithClassName<EnvLog>[] = [
	{
		id: 'action',
		header: translate('general.action'),
		accessorKey: 'action',
		size: 900,
		cell: ({ row }) => {
			const { action, createdBy } = row.original;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);
			return (
				<>
					<div className='flex items-center gap-4'>
						<Avatar size='sm'>
							<AvatarImage src={user?.member.pictureUrl} />
							<AvatarFallback
								isUserAvatar
								color={user?.member?.color as string}
								name={user?.member?.name}
							/>
						</Avatar>
						<div>
							<p className='text-sm text-default font-sfCompact'>{user?.member.name}</p>
							<p className='text-xs text-subtle font-sfCompact'>
								{capitalize(action)} version to its environment
							</p>
						</div>
					</div>
				</>
			);
		},
	},
	{
		id: 'dbStatus',
		header: translate('general.dbStatus'),
		accessorKey: 'dbStatus',
		cell: ({ row }) => {
			const { dbStatus } = row.original;
			return <Badge rounded variant={BADGE_COLOR_MAP[dbStatus?.toUpperCase()]} text={dbStatus} />;
		},
	},
	{
		id: 'serverStatus',
		header: translate('general.serverStatus'),
		accessorKey: 'serverStatus',
		cell: ({ row }) => {
			const { serverStatus } = row.original;
			return (
				<Badge rounded variant={BADGE_COLOR_MAP[serverStatus?.toUpperCase()]} text={serverStatus} />
			);
		},
	},
	{
		id: 'schedulerStatus',
		header: translate('general.schedulerStatus'),
		accessorKey: 'schedulerStatus',
		cell: ({ row }) => {
			const { schedulerStatus } = row.original;
			return (
				<Badge
					rounded
					variant={BADGE_COLOR_MAP[schedulerStatus?.toUpperCase()]}
					text={schedulerStatus}
				/>
			);
		},
	},
	{
		id: 'createdAt',
		header: translate('general.created_at'),
		accessorKey: 'createdAt',
		cell: ({ row }) => {
			const { createdAt } = row.original;
			return <DateText date={createdAt} />;
		},
	},
	{
		id: 'actions',
		className: 'actions',
		size: 45,
		cell: ({ row }) => {
			const { openLogDetails } = useEnvironmentStore.getState();
			return (
				<Button
					variant='blank'
					onClick={() => {
						const logs = {
							dbLogs: row.original.dbLogs.map((log) => ({
								timestamp: DateTime.fromISO(log.startedAt).toFormat('yyyy-MM-dd hh:mm:ss'),
								message: log.message,
								type: log.status,
							})),
							serverLogs: row.original.serverLogs.map((log) => ({
								timestamp: DateTime.fromISO(log.startedAt).toFormat('yyyy-MM-dd hh:mm:ss'),
								message: log.message,
								type: log.status,
							})),
							schedulerLogs: row.original.schedulerLogs.map((log) => ({
								timestamp: DateTime.fromISO(log.startedAt).toFormat('yyyy-MM-dd hh:mm:ss'),
								message: log.message,
								type: log.status,
							})),
						} as SelectedEnvLog;
						openLogDetails(logs);
					}}
				>
					<Document className='w-6 h-6' />
				</Button>
			);
		},
	},
];

export default DeploymentLogColumns;