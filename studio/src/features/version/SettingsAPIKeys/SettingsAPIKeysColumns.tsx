import { ActionsCell } from '@/components/ActionsCell';
import useAuthStore from '@/store/auth/authStore.ts';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIKey, APIKeyTypes, ColumnDefWithClassName } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Badge } from 'components/Badge';
import { BadgeColors } from 'components/Badge/Badge.tsx';
import { Checkbox } from 'components/Checkbox';
import { CopyButton } from 'components/CopyButton';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

const canEdit = getVersionPermission('version.key.update');
const canDelete = getVersionPermission('version.key.delete');

const SettingsAPIKeysColumns: ColumnDefWithClassName<APIKey>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
		className: '!pr-1',
	},
	{
		id: 'name',
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
		enableSorting: true,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { name },
			},
		}) => {
			return <div className='truncate max-w-[15ch]'>{name}</div>;
		},
		size: 100,
	},
	{
		id: 'key',
		header: translate('general.key'),
		accessorKey: 'key',
		className: '!max-w-[420px]',
		enableSorting: false,
		cell: ({
			row: {
				original: { key },
			},
		}) => {
			return (
				<div className='flex items-center gap-2 justify-between'>
					<span className='whitespace-nowrap'>{key}</span>
					<CopyButton text={key} />
				</div>
			);
		},
	},
	{
		id: 'allowRealtime',
		header: () => (
			<span className='whitespace-nowrap'>{translate('version.api_key.realtime_allowed')}</span>
		),
		accessorKey: 'allowRealtime',
		cell: ({
			row: {
				original: { allowRealtime },
			},
		}) => {
			return (
				<Badge
					rounded
					className='whitespace-nowrap'
					variant={allowRealtime ? 'green' : 'red'}
					text={
						allowRealtime
							? translate('version.api_key.allowed')
							: translate('version.api_key.not_allowed')
					}
				/>
			);
		},
	},
	{
		id: 'type',
		header: translate('general.type'),
		accessorKey: 'type',
		cell: ({
			row: {
				original: { type },
			},
		}) => {
			return <Badge className='whitespace-nowrap' variant={mapping[type]} text={type} />;
		},
	},
	{
		id: 'authorizedDomains',
		header: () => (
			<span className='whitespace-nowrap'>{translate('version.api_key.allowed_domains')}</span>
		),
		accessorKey: 'authorizedDomains',
		className: 'max-w-[300px]',
		cell: ({
			row: {
				original: { authorizedDomains, domainAuthorization },
			},
		}) => {
			const isAll = domainAuthorization === 'all';
			if (isAll) {
				return <p>{translate('version.api_key.all_domains')}</p>;
			}
			return (
				<div className='flex items-center gap-2 overflow-auto max-w-[400px] no-scrollbar'>
					{authorizedDomains.map((domain) => (
						<Badge key={domain} text={domain} variant='orange' />
					))}
				</div>
			);
		},
	},
	{
		id: 'authorizedIPs',
		header: () => (
			<span className='whitespace-nowrap'>{translate('version.api_key.allowed_ips')}</span>
		),
		accessorKey: 'authorizedIPs',
		className: 'max-w-[300px]',
		cell: ({
			row: {
				original: { authorizedIPs, IPAuthorization },
			},
		}) => {
			const isAll = IPAuthorization === 'all';
			if (isAll) {
				return <p>{translate('version.api_key.all_ips')}</p>;
			}
			return (
				<div className='flex items-center gap-2 overflow-auto max-w-[400px] no-scrollbar'>
					{authorizedIPs.map((ip) => (
						<Badge key={ip} text={ip} variant='blue' />
					))}
				</div>
			);
		},
	},
	{
		id: 'expiryDate',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.expires_at')}
				column={column}
			/>
		),
		accessorKey: 'expiryDate',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { expiryDate },
			},
		}) => {
			if (!expiryDate) return;
			return <DateText date={expiryDate} />;
		},
	},
	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				column={column}
			/>
		),
		accessorKey: 'created_at',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { createdAt, createdBy },
			},
		}) => {
			const isMe = useAuthStore.getState().user?._id === createdBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={createdAt}>{avatar}</DateText>;
		},
	},
	{
		id: 'updatedAt',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at')}
				column={column}
			/>
		),
		accessorKey: 'updatedAt',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt, updatedBy },
			},
		}) => {
			if (!updatedBy) return null;
			const isMe = useAuthStore.getState().user?._id === updatedBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={updatedAt}>{avatar}</DateText>;
		},
	},
	{
		id: 'actions',
		className: 'actions',
		cell: ({ row: { original } }) => {
			async function onDelete() {
				const { version } = useVersionStore.getState();
				const { deleteAPIKey } = useSettingsStore.getState();
				if (!version) return;
				await deleteAPIKey({
					appId: version.appId,
					orgId: version.orgId,
					keyId: original._id,
					versionId: version._id,
				});
			}

			function editHandler() {
				const { setSelectedAPIKey, setEditAPIKeyDrawerIsOpen } = useSettingsStore.getState();
				setSelectedAPIKey(original);
				setEditAPIKeyDrawerIsOpen(true);
			}

			return (
				<div className='flex items-center justify-end gap-0.5'>
					<ActionsCell onEdit={editHandler} canEdit={canEdit} original={original}>
						<TableConfirmation
							align='end'
							closeOnConfirm
							title={translate('version.api_key.delete_modal_title')}
							description={translate('version.api_key.delete_modal_desc')}
							onConfirm={onDelete}
							contentClassName='m-0'
							hasPermission={canDelete}
						/>
					</ActionsCell>
				</div>
			);
		},
	},
];

const mapping: Record<APIKeyTypes, BadgeColors> = {
	'full-access': 'green',
	'no-access': 'red',
	'custom-allowed': 'blue',
	'custom-excluded': 'purple',
};

export default SettingsAPIKeysColumns;
