import { Badge } from '@/components/Badge';
import { BADGE_COLOR_MAP } from '@/constants';
import { ClusterComponentReleaseInfo } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';

const ReleaseColumns: ColumnDef<ClusterComponentReleaseInfo>[] = [
	{
		id: 'module',
		accessorKey: 'module',
		header: () => <span>{t('cluster.component')}</span>,
	},
	{
		id: 'status',
		accessorKey: 'status',
		header: () => <span>{t('cluster.status')}</span>,
		cell: ({ row }) => {
			const { status } = row.original;
			return <Badge variant={BADGE_COLOR_MAP[status]} text={status} />;
		},
	},
	{
		id: 'current',
		accessorKey: 'version',
		header: () => <span>{t('cluster.current')}</span>,
	},
	{
		id: 'latest',
		accessorKey: 'latest',
		header: () => <span>{t('cluster.latest')}</span>,
	},
];

export default ReleaseColumns;
