import { Button } from '@/components/Button';
import { DateText } from '@/components/DateText';
import { Version as VersionIcon } from '@/components/icons';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Application, Version } from '@/types';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { leaveChannel, translate } from '@/utils';
import { LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/utils';
import useVersionStore from '@/store/version/versionStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
export const VersionTableColumns: ColumnDef<Version>[] = [
	{
		id: 'name',
		header: translate('general.name'),
		accessorKey: 'name',
		size: 75,
		cell: ({ row }) => {
			const { name, master } = row.original;
			return (
				<div className='flex items-center gap-1'>
					<VersionIcon className='w-5 h-5 text-subtle mr-2 shrink-0' />
					<span className={cn(master && 'text-elements-green')}>{name}</span>
				</div>
			);
		},
	},
	{
		id: 'createdBy',
		header: translate('general.created_at'),
		accessorKey: 'createdBy',
		size: 200,
		cell: ({ row }) => {
			const { createdAt, createdBy } = row.original;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);
			return <DateText date={createdAt} user={user} />;
		},
	},
	{
		id: 'permissions',
		header: translate('version.read_write'),
		accessorKey: 'readOnly',
		size: 100,
		cell: ({ row }) => {
			const { readOnly } = row.original;
			return (
				<div className='flex items-center gap-3'>
					{readOnly ? (
						<LockSimple size={20} className='text-elements-red' />
					) : (
						<LockSimpleOpen size={20} className='text-elements-green' />
					)}
					<span className='font-sfCompact text-sm'>
						{readOnly ? translate('version.readOnly') : translate('version.read_write')}
					</span>
				</div>
			);
		},
	},
	{
		id: 'actions',
		header: '',
		size: 75,
		cell: ({ row }) => {
			const { _id } = row.original;
			const app = useApplicationStore.getState().application;
			const orgId = useOrganizationStore.getState().organization?._id as string;
			const { closeVersionDrawer, selectApplication } = useApplicationStore.getState();
			const { version, selectVersion } = useVersionStore.getState();
			const { getAppVersionEnvironment } = useEnvironmentStore.getState();
			const onSelect = () => {
				if (!app) return;
				selectApplication(app);
				leaveChannel(version?._id as string);
				selectVersion(row.original as Version);
				closeVersionDrawer();
				getAppVersionEnvironment({ appId: app._id, orgId, versionId: _id });
			};
			return <OpenVersion id={_id} app={app as Application} onSelect={onSelect} />;
		},
	},
];

function OpenVersion({
	id,
	app,
	onSelect,
}: {
	id: string;
	app: Application;
	onSelect: () => void;
}) {
	const canViewVersion = useAuthorizeVersion('version.view');
	return (
		<Button
			disabled={!canViewVersion}
			size='sm'
			variant='secondary'
			onClick={onSelect}
			to={`/organization/${app?.orgId}/apps/${app?._id}/version/${id}`}
		>
			{translate('general.open')}
		</Button>
	);
}
