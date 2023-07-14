import { ColumnDefWithClassName, NPMPackage } from '@/types';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { translate } from '@/utils';
import useAuthStore from '@/store/auth/authStore.ts';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { DateText } from 'components/DateText';
import useVersionStore from '@/store/version/versionStore.ts';
import { TableConfirmation } from 'components/Table';
import { Button } from 'components/Button';
import { Trash } from '@phosphor-icons/react';

const NPMPackagesColumns: ColumnDefWithClassName<NPMPackage>[] = [
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
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'version',
		header: translate('general.version').toUpperCase(),
		accessorKey: 'version',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton text={translate('general.created_at').toUpperCase()} column={column} />
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
		id: 'actions',
		className: 'actions',
		cell: ({
			row: {
				original: { _id },
			},
		}) => {
			const { version, deleteNPMPackage } = useVersionStore.getState();
			async function clickHandler() {
				if (!version) return;
				await deleteNPMPackage({
					versionId: version?._id,
					orgId: version?.orgId,
					appId: version?.appId,
					packageId: _id,
				});
			}
			return (
				<div className='flex items-center'>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('version.npm.delete_modal_title')}
						description={translate('version.npm.delete_modal_desc')}
						onConfirm={clickHandler}
						contentClassName='m-0'
					>
						<Button
							variant='blank'
							rounded
							className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
							iconOnly
						>
							<Trash size={20} />
						</Button>
					</TableConfirmation>
				</div>
			);
		},
	},
];

export default NPMPackagesColumns;
