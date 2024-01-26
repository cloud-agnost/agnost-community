import { CopyInput } from '@/components/CopyInput';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { SettingsContainer } from '@/features/version/SettingsContainer';
import useClusterStore from '@/store/cluster/clusterStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ClusterResources from './ClusterComponents';
import ClusterSmtpForm from './ClusterSmtpForm';
import CustomDomains from './CustomDomains';
import TransferClusterOwnership from './TransferClusterOwnership';

export default function ProfileSettingsClusterManagement() {
	const { t } = useTranslation();
	const TabItems = ['General', 'Cluster Resources', 'SMTP', 'Custom Domains'];
	const { organization } = useOrganizationStore();
	const { getClusterInfo, checkDomainStatus, clusterDomainError } = useClusterStore();

	useEffect(() => {
		getClusterInfo();
	}, []);

	useQuery({
		queryFn: checkDomainStatus,
		queryKey: ['checkDomainStatus'],
		retry: false,
		enabled: _.isNil(clusterDomainError),
	});

	return (
		<SettingsContainer pageTitle={t('profileSettings.clusters_title')}>
			<Tabs defaultValue={TabItems[0]}>
				<div className='flex items-center pb-6 justify-between'>
					<TabsList
						defaultValue={TabItems[0]}
						align='center'
						className='flex-1 h-full'
						containerClassName='!p-0'
					>
						{TabItems.map((tab) => (
							<TabsTrigger key={tab} id={tab} value={tab} className='flex-1'>
								{tab}
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				<TabsContent value='General' className='h-full'>
					<SettingsFormItem
						className='space-y-0 py-0 pb-6'
						contentClassName='pt-6'
						title={t('cluster.yourClusterId')}
						description={t('cluster.yourClusterIdDescription')}
					>
						<CopyInput readOnly value={organization?.iid} />
					</SettingsFormItem>
					<SettingsFormItem
						className='space-y-0 py-0 pb-6'
						contentClassName='pt-6'
						title={t('cluster.transferClusterOwnership')}
						description={t('cluster.transferClusterOwnershipDescription')}
					>
						<TransferClusterOwnership />
					</SettingsFormItem>
				</TabsContent>
				<TabsContent value='Cluster Resources' className='h-[calc(100%-4rem)]'>
					<ClusterResources />
				</TabsContent>
				<TabsContent value='SMTP' className='overflow-y-auto  h-[calc(100%-4rem)]'>
					<ClusterSmtpForm />
				</TabsContent>
				<TabsContent value='Custom Domains' className='overflow-y-auto  h-[calc(100%-4rem)]'>
					<CustomDomains />
				</TabsContent>
			</Tabs>
		</SettingsContainer>
	);
}
