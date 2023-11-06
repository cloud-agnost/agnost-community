import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { Checkbox } from '@/components/Checkbox';
import { CopyButton } from '@/components/CopyButton';
import { SortButton } from '@/components/DataTable';
import { DateText } from '@/components/DateText';
import { TableConfirmation } from '@/components/Table';
import { BADGE_COLOR_MAP, HTTP_METHOD_BADGE_MAP } from '@/constants';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import useVersionStore from '@/store/version/versionStore';
import { ColumnDefWithClassName, Endpoint, TabTypes } from '@/types';
import { translate } from '@/utils';
import { TabLink } from '../version/Tabs';

const { openEditEndpointDialog, deleteEndpoint } = useEndpointStore.getState();
const { version } = useVersionStore.getState();
function deleteEndpointHandler(toDeleteEndpoint: Endpoint) {
	deleteEndpoint({
		epId: toDeleteEndpoint?._id,
		orgId: version?.orgId,
		appId: version?.appId,
		versionId: version?._id,
	});
}

const EndpointColumns: ColumnDefWithClassName<Endpoint>[] = [
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
		size: 40,
	},
	{
		id: 'name',
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
		accessorKey: 'name',
		enableSorting: true,
		sortingFn: 'textCaseSensitive',
		size: 200,
		cell: ({ row }) => {
			const { name, _id } = row.original;
			return <TabLink name={name} path={`${_id}`} type={TabTypes.Endpoint} />;
		},
	},
	{
		id: 'method',
		header: ({ column }) => <SortButton text={translate('endpoint.method')} column={column} />,
		accessorKey: 'method',
		enableSorting: true,
		sortingFn: 'textCaseSensitive',
		size: 100,
		cell: ({ row }) => {
			const { method } = row.original;
			return <Badge variant={HTTP_METHOD_BADGE_MAP[method]} text={method} />;
		},
	},
	{
		id: 'path',
		header: ({ column }) => <SortButton text={translate('endpoint.path')} column={column} />,
		enableSorting: true,
		sortingFn: 'alphanumericCaseSensitive',
		accessorKey: 'path',
		size: 200,
		cell: ({ row }) => {
			const { path } = row.original;
			const env = useEnvironmentStore.getState().environment;
			const copyText = `${window.location.origin}/${env?.iid}/api${path}`;
			return (
				<div className='flex items-center gap-8 group'>
					<div className='truncate max-w-[15ch]'>{path}</div>
					<CopyButton text={copyText} className='hidden group-hover:block' />
				</div>
			);
		},
	},
	{
		id: 'API KEY',
		accessorKey: 'apiKeyRequired',
		header: ({ column }) => <SortButton text={translate('endpoint.apiKey')} column={column} />,
		enableSorting: true,
		sortingFn: 'basic',
		size: 200,
		cell: ({ row }) => {
			const { apiKeyRequired } = row.original;
			const apiKeyRequiredText = apiKeyRequired
				? translate('endpoint.required')
				: translate('endpoint.optional');
			return (
				<Badge
					variant={BADGE_COLOR_MAP[apiKeyRequiredText.toUpperCase()]}
					text={apiKeyRequiredText}
					rounded
				/>
			);
		},
	},
	{
		id: 'session',
		header: ({ column }) => <SortButton text={translate('endpoint.session')} column={column} />,
		enableSorting: true,
		sortingFn: 'basic',
		accessorKey: 'sessionRequired',
		size: 200,
		cell: ({ row }) => {
			const { sessionRequired } = row.original;
			const sessionRequiredText = sessionRequired
				? translate('endpoint.required')
				: translate('endpoint.optional');
			return (
				<Badge
					variant={BADGE_COLOR_MAP[sessionRequiredText.toUpperCase()]}
					text={sessionRequiredText}
					rounded
				/>
			);
		},
	},
	{
		id: 'created_at',
		header: ({ column }) => <SortButton text={translate('general.created_at')} column={column} />,
		enableSorting: true,
		sortingFn: 'datetime',
		accessorKey: 'createdAt',
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
		id: 'updated_at',
		header: ({ column }) => <SortButton text={translate('general.updated_at')} column={column} />,
		accessorKey: 'updatedAt',
		size: 200,
		cell: ({ row }) => {
			const { updatedAt, updatedBy } = row.original;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === updatedBy);
			return updatedBy && <DateText date={updatedAt} user={user} />;
		},
	},
	{
		id: 'actions',
		className: 'actions',
		size: 45,
		cell: ({ row }) => {
			return (
				<ActionsCell<Endpoint>
					original={row.original}
					canEditKey='endpoint.update'
					onEdit={() => openEditEndpointDialog(row.original)}
					type='app'
				>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('endpoint.delete.title')}
						description={translate('endpoint.delete.message')}
						onConfirm={() => deleteEndpointHandler(row.original)}
						contentClassName='m-0'
						permissionKey='endpoint.delete'
					/>
				</ActionsCell>
			);
		},
	},
];

export default EndpointColumns;
