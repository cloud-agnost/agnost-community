import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore.ts';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { ColumnDefWithClassName, NPMPackage } from '@/types';
import { translate } from '@/utils';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

const NPMPackagesColumns: ColumnDefWithClassName<NPMPackage>[] = [
	{
		id: 'select',
		size: undefined,
		className:
			'!max-w-[20px] !w-[20px] [&_.checkbox-wrapper]:mx-auto [&_.checkbox-wrapper]:w-fit !p-0',
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
		className: 'actions max-w-[20px]',
		cell: ({
			row: {
				original: { _id },
			},
		}) => {
			const { version } = useVersionStore.getState();
			const { deleteNPMPackage } = useSettingsStore.getState();
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
					<ConfirmTable onDelete={clickHandler} />
				</div>
			);
		},
	},
];

function ConfirmTable({ onDelete }: { onDelete: () => void }) {
	const role = useApplicationStore.getState().role;
	const hasAppPermission = useAuthorizeApp({
		key: 'version.package.delete',
		role,
	});
	return (
		<TableConfirmation
			align='end'
			closeOnConfirm
			showAvatar={false}
			title={translate('version.npm.delete_modal_title')}
			description={translate('version.npm.delete_modal_desc')}
			onConfirm={onDelete}
			contentClassName='m-0'
			disabled={!hasAppPermission}
		/>
	);
}

export default NPMPackagesColumns;
