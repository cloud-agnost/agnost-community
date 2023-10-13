import { CopyInput } from '@/components/CopyInput';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/Tabs';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';
import useOrganizationStore from '@/store/organization/organizationStore';
import { useTranslation } from 'react-i18next';
import ClusterResources from './ClusterComponents';
import ClusterSmtpForm from './ClusterSmtpForm';
import TransferClusterOwnership from './TransferClusterOwnership';

export default function ProfileSettingsClusterManagement() {
	const { t } = useTranslation();
	const TabItems = ['General', 'Cluster Resources', 'SMTP'];
	const { organization } = useOrganizationStore();
	return (
		<UserSettingsLayout title={t('profileSettings.clusters_title')}>
			<Tabs defaultValue={TabItems[0]}>
				<div className='flex items-center pb-6 justify-between'>
					<TabsList
						defaultValue={TabItems[0]}
						align='center'
						className='flex-1'
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
						title={t('cluster.clusterVersion')}
						description={t('cluster.transferClusterOwnership')}
					>
						<span className='text-subtle text-sm font-sfCompact'>{organization?.iid}</span>
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
			</Tabs>
		</UserSettingsLayout>
	);
}
