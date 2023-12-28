import { Feedback } from '@/components/Alert';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { TableLoading } from '@/components/Table/Table';
import {
	AddVersionDomain,
	CustomDomainActions,
	VersionDomainColumns,
} from '@/features/version/CustomDomain';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import { useAuthorizeVersion, useInfiniteScroll, useTable } from '@/hooks';
import useClusterStore from '@/store/cluster/clusterStore';
import useSettingsStore from '@/store/version/settingsStore';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function VersionSettingsCustomDomain() {
	const { t } = useTranslation();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { getCustomDomainsOfVersion, versionDomains, lastFetchedDomainPage } = useSettingsStore();
	const { checkDomainStatus, clusterDomainError } = useClusterStore();
	const { getClusterInfo, cluster } = useClusterStore();
	const table = useTable({
		data: versionDomains,
		columns: VersionDomainColumns,
	});

	const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getCustomDomainsOfVersion,
		queryKey: 'getCustomDomainsOfVersion',
		lastFetchedPage: lastFetchedDomainPage,
		dataLength: versionDomains.length,
	});

	useQuery({
		queryFn: getClusterInfo,
		queryKey: ['getClusterInfo'],
		enabled: _.isEmpty(cluster),
	});

	useQuery({
		queryFn: checkDomainStatus,
		queryKey: ['checkDomainStatus'],
		retry: false,
		enabled: _.isNil(clusterDomainError),
	});

	return (
		<SettingsContainer
			pageTitle={t('cluster.custom_domain')}
			action={<CustomDomainActions table={table} />}
			className='table-view'
		>
			{!_.isNil(clusterDomainError) ? (
				<div className='h-full flex flex-col items-center justify-center'>
					<Feedback
						title={clusterDomainError?.error}
						description={clusterDomainError?.details}
						className='max-w-2xl'
					/>
				</div>
			) : versionDomains.length > 0 ? (
				<InfiniteScroll
					scrollableTarget='setting-container-content'
					dataLength={versionDomains.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable table={table} containerClassName='border-none rounded-none' />
				</InfiniteScroll>
			) : (
				<EmptyState type='custom-domain' title={t('version.npm.no_package_found')} />
			)}

			<AddVersionDomain open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</SettingsContainer>
	);
}
