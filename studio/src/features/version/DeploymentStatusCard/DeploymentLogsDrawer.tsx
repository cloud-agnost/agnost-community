import { DataTable } from '@/components/DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/Dialog';
import { Logs } from '@/components/Log';
import useEnvironmentStore from '@/store/environment/environmentStore';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from 'components/Drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DeploymentLogColumns from './DeploymentLogColumns';
interface DeploymentLogsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DeploymentLogsDrawer({ open, onOpenChange }: DeploymentLogsDrawerProps) {
	const { t } = useTranslation();
	const [selectedTab, setSelectedTab] = useState<string>('db');
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const {
		getEnvironmentLogs,
		environment,
		envLogs,
		isLogDetailsOpen,
		closeLogDetails,
		selectedLog,
	} = useEnvironmentStore();

	useEffect(() => {
		if (open) {
			getEnvironmentLogs({
				orgId: orgId as string,
				appId: appId as string,
				versionId: versionId as string,
				envId: environment._id,
				page: 0,
				size: 50,
			});
		}
	}, [open]);

	return (
		<>
			<Drawer open={open} onOpenChange={isLogDetailsOpen ? undefined : onOpenChange}>
				<DrawerContent position='right' size='lg'>
					<DrawerHeader>
						<DrawerTitle>{t('version.logs')}</DrawerTitle>
					</DrawerHeader>
					<div className='p-6 scroll'>
						<DataTable columns={DeploymentLogColumns} data={envLogs} />
					</div>
					<DrawerFooter>
						<DrawerClose asChild></DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<Dialog open={isLogDetailsOpen} onOpenChange={closeLogDetails}>
				<DialogContent className='max-w-3xl'>
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
							<TabsTrigger value='server'>{t('general.serverLogs')}</TabsTrigger>
							<TabsTrigger value='scheduler'>{t('general.schedulerLogs')}</TabsTrigger>
						</TabsList>

						<TabsContent className='h-[300px] w-full' value='db'>
							<Logs className='h-full' logs={selectedLog.dbLogs} />
						</TabsContent>
						<TabsContent className='h-[300px]' value='server'>
							<Logs className='h-full' logs={selectedLog.serverLogs} />
						</TabsContent>
						<TabsContent className='h-[300px]' value='scheduler'>
							<Logs className='h-full' logs={selectedLog.schedulerLogs} />
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>
		</>
	);
}
