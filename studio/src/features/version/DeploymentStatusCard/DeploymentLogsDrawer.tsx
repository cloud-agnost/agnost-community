import { DataTable } from '@/components/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/Dialog';
import { Logs } from '@/components/Log';
import { useTable } from '@/hooks';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { useQuery } from '@tanstack/react-query';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/Tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import BeatLoader from 'react-spinners/BeatLoader';
import DeploymentLogColumns from './DeploymentLogColumns';
interface DeploymentLogsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DeploymentLogsDrawer({ open, onOpenChange }: DeploymentLogsDrawerProps) {
	const { t } = useTranslation();
	const [selectedTab, setSelectedTab] = useState<string>('db');
	const {
		getEnvironmentLogsDetail,
		getEnvironmentLogs,
		environment,
		envLogs,
		isLogDetailsOpen,
		closeLogDetails,
		selectedLog,
		log,
	} = useEnvironmentStore();
	const table = useTable({
		data: envLogs,
		columns: DeploymentLogColumns,
	});
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const { isPending } = useQuery({
		queryFn: () =>
			getEnvironmentLogs({
				orgId: orgId as string,
				appId: appId as string,
				versionId: versionId as string,
				envId: environment._id,
				page: 0,
				size: 50,
			}),
		queryKey: ['getEnvironmentLogs'],
		enabled: open,
		refetchOnWindowFocus: false,
	});
	const { isPending: isDetailsFetching } = useQuery({
		queryFn: () =>
			getEnvironmentLogsDetail({
				orgId: orgId as string,
				appId: appId as string,
				versionId: versionId as string,
				envId: environment._id,
				logId: log._id,
			}),
		queryKey: ['getEnvironmentLogsDetail'],
		enabled: isLogDetailsOpen && !!log._id,
	});

	return (
		<>
			<Drawer open={open} onOpenChange={isLogDetailsOpen ? undefined : onOpenChange}>
				<DrawerContent position='right' size='lg'>
					<DrawerHeader>
						<DrawerTitle>{t('version.logs')}</DrawerTitle>
					</DrawerHeader>
					<div className='p-6 scroll'>
						{isPending ? (
							<div className='flex justify-center items-center h-[300px]'>
								<BeatLoader color='#6884FD' size={16} margin={12} />
							</div>
						) : (
							<DataTable table={table} />
						)}
					</div>
				</DrawerContent>
			</Drawer>
			<Dialog open={isLogDetailsOpen} onOpenChange={closeLogDetails}>
				<DialogContent className='max-w-5xl'>
					<DialogHeader>
						<DialogTitle>{t('version.log_details')}</DialogTitle>
					</DialogHeader>

					<Tabs
						defaultValue={selectedTab}
						onValueChange={setSelectedTab}
						className='max-w-full overflow-auto'
					>
						<TabsList>
							<TabsTrigger value='db'>{t('general.dbLogs')}</TabsTrigger>
							<TabsTrigger value='server'>
								{t('general.serverLogs')}
								<span className='text-subtle font-normal ml-2'>
									({log.serverStatusOK}/{log.serverStatusError})
								</span>
							</TabsTrigger>
							<TabsTrigger value='scheduler'>{t('general.schedulerLogs')}</TabsTrigger>
						</TabsList>

						{isDetailsFetching ? (
							<div className='flex justify-center items-center h-[300px]'>
								<BeatLoader color='#6884FD' size={16} margin={12} />
							</div>
						) : (
							<>
								<TabsContent className='h-[300px] w-full' value='db'>
									<Logs className='h-full' logs={selectedLog.dbLogs} />
								</TabsContent>
								<TabsContent className='h-[300px]' value='server'>
									<Logs className='h-full' logs={selectedLog.serverLogs} />
								</TabsContent>
								<TabsContent className='h-[300px]' value='scheduler'>
									<Logs className='h-full' logs={selectedLog.schedulerLogs} />
								</TabsContent>
							</>
						)}
					</Tabs>
				</DialogContent>
			</Dialog>
		</>
	);
}
