import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { Checkbox } from '@/components/Checkbox';
import { CopyButton } from '@/components/CopyButton';
import { DateText } from '@/components/DateText';
import { BADGE_COLOR_MAP, ENDPOINT_METHOD_TEXT_COLOR, HTTP_METHOD_BADGE_MAP } from '@/constants';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { ColumnDefWithClassName, Endpoint } from '@/types';
import { cn, translate } from '@/utils';

const { openDeleteEndpointDialog } = useEndpointStore.getState();

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
		header: translate('endpoint.name'),
		accessorKey: 'name',
		size: 200,
		cell: ({ row }) => {
			const { name, iid, method } = row.original;
			return (
				<div className='flex justify-between items-center group'>
					<div>
						<div
							className={cn(
								'truncate max-w-[15ch] font-sfCompact text-xs',
								ENDPOINT_METHOD_TEXT_COLOR[method],
							)}
						>
							{name}
						</div>
						<div className='truncate max-w-[15ch] font-sfCompact text-sm'>{iid}</div>
					</div>
					<CopyButton text={name} className='hidden group-hover:block' />
				</div>
			);
		},
	},
	{
		id: 'method',
		header: translate('endpoint.method'),
		accessorKey: 'method',
		size: 100,
		cell: ({ row }) => {
			const { method } = row.original;
			return <Badge variant={HTTP_METHOD_BADGE_MAP[method]} text={method} />;
		},
	},
	{
		id: 'path',
		header: translate('endpoint.path'),
		accessorKey: 'path',
		size: 200,
	},
	{
		id: 'API KEY',
		header: translate('endpoint.apiKey'),
		accessorKey: 'apiKeyRequired',
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
		header: translate('endpoint.session'),
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
		header: translate('endpoint.createdAt'),
		accessorKey: 'created_at',
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
		header: translate('endpoint.updatedAt'),
		accessorKey: 'updated_at',
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
			const { _id } = row.original;
			return (
				<ActionsCell<Endpoint>
					original={row.original}
					onDelete={() => openDeleteEndpointDialog(row.original)}
					canDeleteKey='endpoint.delete'
					canEditKey='endpoint.update'
					to={`${_id}`}
					type='version'
				/>
			);
		},
	},
];

export default EndpointColumns;
