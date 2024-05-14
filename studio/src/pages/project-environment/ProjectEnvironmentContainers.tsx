import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import ContainerColumns from '@/features/container/ContainerColumns';
import CreateContainerButton from '@/features/container/CreateContainerButton';
import { useTable } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import { TabTypes } from '@/types';
import { Container } from '@/types/container';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

const containers: Container[] = [
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'deployment-001',
		name: 'User Management',
		type: 'deployment',
		variables: [
			{ name: 'NODE_ENV', value: 'production' },
			{ name: 'LOG_LEVEL', value: 'info' },
		],
		sourceOrRegistry: 'source',
		source: {
			repoType: 'github',
			repo: 'https://github.com/org/user-management',
			branch: 'main',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'deployment-002',
		name: 'Payment Processor',
		type: 'deployment',
		variables: [
			{ name: 'PAYMENT_GATEWAY', value: 'Stripe' },
			{ name: 'CURRENCY', value: 'USD' },
		],
		sourceOrRegistry: 'registry',
		registry: {
			registryId: 'payment-registry',
			image: 'docker.io/organization/payment:latest',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'deployment-003',
		name: 'Notification Service',
		type: 'deployment',
		variables: [
			{ name: 'SEND_EMAILS', value: 'true' },
			{ name: 'SEND_SMS', value: 'false' },
		],
		sourceOrRegistry: 'source',
		source: {
			repoType: 'gitlab',
			repo: 'https://gitlab.com/org/notification-service',
			branch: 'develop',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'stateful-001',
		name: 'Database Cluster',
		type: 'stateful set',
		variables: [
			{ name: 'DB_HOST', value: 'cluster1-db' },
			{ name: 'DB_PORT', value: '5432' },
		],
		sourceOrRegistry: 'registry',
		registry: {
			registryId: 'db-registry',
			image: 'docker.io/organization/db-cluster:latest',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'stateful-002',
		name: 'Redis Cache',
		type: 'stateful set',
		variables: [{ name: 'CACHE_SIZE', value: '4GB' }],
		sourceOrRegistry: 'source',
		source: {
			repoType: 'github',
			repo: 'https://github.com/org/redis-cache',
			branch: 'release',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'stateful-003',
		name: 'Elasticsearch Cluster',
		type: 'stateful set',
		variables: [
			{ name: 'CLUSTER_SIZE', value: '5 nodes' },
			{ name: 'SHARDS', value: '8' },
		],
		sourceOrRegistry: 'registry',
		registry: {
			registryId: 'es-cluster-registry',
			image: 'docker.io/organization/elasticsearch:latest',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'cron-001',
		name: 'Daily Backup',
		type: 'cron job',
		variables: [
			{ name: 'BACKUP_PATH', value: '/backups/daily' },
			{ name: 'TIMEOUT', value: '30m' },
		],
		sourceOrRegistry: 'source',
		source: {
			repoType: 'bitbucket',
			repo: 'https://bitbucket.org/org/daily-backup',
			branch: 'main',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'cron-002',
		name: 'Weekly Report',
		type: 'cron job',
		variables: [
			{ name: 'REPORT_FORMAT', value: 'PDF' },
			{ name: 'RECIPIENTS', value: 'team@example.com' },
		],
		sourceOrRegistry: 'registry',
		registry: {
			registryId: 'report-registry',
			image: 'docker.io/organization/report-generator:latest',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'cron-003',
		name: 'Monthly Maintenance',
		type: 'cron job',
		variables: [
			{ name: 'MAINTENANCE_SCRIPT', value: '/scripts/monthly-maintenance.sh' },
			{ name: 'NOTIFY_ON_FAILURE', value: 'true' },
		],
		sourceOrRegistry: 'source',
		source: {
			repoType: 'github',
			repo: 'https://github.com/org/monthly-maintenance',
			branch: 'stable',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'knative-001',
		name: 'Webhook Listener',
		type: 'knative service',
		variables: [
			{ name: 'WEBHOOK_SECRET', value: 's3cr3t' },
			{ name: 'PORT', value: '3000' },
		],
		sourceOrRegistry: 'registry',
		registry: {
			registryId: 'knative-registry',
			image: 'docker.io/organization/webhook-listener:latest',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'knative-002',
		name: 'Image Processor',
		type: 'knative service',
		variables: [
			{ name: 'IMAGE_SOURCE', value: '/mnt/images' },
			{ name: 'OUTPUT_FORMAT', value: 'JPEG' },
		],
		sourceOrRegistry: 'source',
		source: {
			repoType: 'github',
			repo: 'https://github.com/org/image-processor',
			branch: 'dev',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
	{
		orgId: '6638d47842e9634959a07dbc',
		projectId: '663cdad67db8d3b92a0a6ace',
		envId: '663cdad67db8d3b92a0a6ad2',
		iid: 'knative-003',
		name: 'Real-time Analytics',
		type: 'knative service',
		variables: [
			{ name: 'ANALYTICS_ENDPOINT', value: 'https://analytics.example.com' },
			{ name: 'API_KEY', value: 'apikey123' },
		],
		sourceOrRegistry: 'registry',
		registry: {
			registryId: 'analytics-registry',
			image: 'docker.io/organization/real-time-analytics:latest',
		},
		createdBy: '6638d47142e9634959a07da4',
		updatedBy: '6638d47142e9634959a07da4',
		createdAt: '2024-05-06T13:00:40.804+00:00',
		updatedAt: '2024-05-06T13:00:40.804+00:00',
	},
];

export default function ProjectEnvironmentDetail() {
	const { t } = useTranslation();
	const isFetching = false;
	const canCreate = true;

	const table = useTable<Container>({
		data: containers,
		columns: ContainerColumns,
	});
	return (
		<VersionTabLayout
			searchable
			type={TabTypes.Endpoint}
			title={t('project.containers') as string}
			isEmpty={!containers.length}
			onMultipleDelete={() => {}}
			disabled={!canCreate}
			loading={isFetching && !containers.length}
			selectedRowCount={table.getSelectedRowModel().rows.length}
			onClearSelected={() => table.toggleAllRowsSelected(false)}
			handlerButton={<CreateContainerButton />}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={containers.length}
				next={() => {}}
				hasMore={false}
				loader={false && <TableLoading />}
			>
				<DataTable table={table} />
			</InfiniteScroll>
		</VersionTabLayout>
	);
}
