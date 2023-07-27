import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from 'components/Drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/Table';
import { Avatar, AvatarFallback, AvatarImage } from 'components/Avatar';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { formatDate } from '@/utils';
import { Button } from 'components/Button';
import { Document } from 'components/icons';
import { useTranslation } from 'react-i18next';
import { Modal } from 'components/Modal';
import { useState } from 'react';
import { ScrollArea, ScrollBar } from 'components/ScrollArea';

interface DeploymentLogsDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	logs: any[];
}

export default function DeploymentLogsDrawer({
	logs,
	open,
	onOpenChange,
}: DeploymentLogsDrawerProps) {
	const { t } = useTranslation();
	const [logModalIsOpen, setLogModalIsOpen] = useState(false);
	const [selectedLog, setSelectedLog] = useState(null);

	function openLogDetails(log: any) {
		setSelectedLog(log);
		setLogModalIsOpen(true);
	}

	function closeLogDetails() {
		setLogModalIsOpen(false);
		setSelectedLog(null);
	}

	return (
		<>
			<Drawer open={open} onOpenChange={logModalIsOpen ? undefined : onOpenChange}>
				<DrawerContent position='right' size='md'>
					<DrawerHeader>
						<DrawerTitle>{t('version.logs')}</DrawerTitle>
					</DrawerHeader>
					<div className='p-6'>
						<Table className='bg-inherit'>
							<TableHeader>
								<TableRow>
									<TableHead className='w-[100px]'>ACTION</TableHead>
									<TableHead>STATUS</TableHead>
									<TableHead>DATETIME</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{logs.map((log, index) => (
									<TableRow key={index} className='font-sfCompact font-normal'>
										<TableCell className='font-medium'>
											<div className='flex gap-2 items-center'>
												<Avatar size='sm'>
													<AvatarImage src={log.user.profilePicture} />
													<AvatarFallback color={log.user.color} name={log.user.name} />
												</Avatar>
												<div className='flex flex-col font-normal font-sfCompact whitespace-nowrap'>
													<span className='text-sm leading-6 text-default'>{log.user.name}</span>
													<p className='text-[11px] text-subtle leading-[21px]'>
														{log.description}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												text={log.status}
												variant={BADGE_COLOR_MAP[log.status.toUpperCase()]}
												rounded
											/>
										</TableCell>
										<TableCell className='whitespace-nowrap'>
											<span className='block text-default text-sm leading-6'>
												{formatDate(log.date, {
													month: 'short',
													day: 'numeric',
													year: 'numeric',
												})}
											</span>
											<time className='text-[11px] text-subtle leading-[21px]'>
												{formatDate(log.date, {
													hour: 'numeric',
													minute: 'numeric',
												})}
											</time>
										</TableCell>
										<TableCell className='text-right'>
											<Button
												onClick={() => openLogDetails(log)}
												variant='blank'
												className='hover:bg-lighter text-xl aspect-square text-icon-base hover:text-icon-secondary'
												rounded
												iconOnly
											>
												<Document />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<DrawerFooter>
						<DrawerClose asChild></DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
			<Modal title='Deployment Log Details' isOpen={logModalIsOpen} closeModal={closeLogDetails}>
				{/* TODO: handle it */}
				{selectedLog && null}
				<ScrollArea className='w-full p-4 bg-wrapper-background-light rounded'>
					<ScrollBar orientation='horizontal' />
					<div className='whitespace-pre text-default leading-6 text-sm font-mono'>
						<>{`2023-03-01T09:28:45 Started deployment process
2023-03-01T09:28:45 Started processing HR portal database (2ms)
2023-03-01T09:28:45 Completed processing database (2ms)
2023-03-01T09:28:45 Started processing Accounting database (2ms)
2023-03-01T09:28:45 Completed processing Accounting database (2ms)
2023-03-01T09:28:45 Created default collections (2ms)
2023-03-01T09:28:45 Deployed endpoints (2ms)`}</>
					</div>
				</ScrollArea>
				<div className='flex justify-end'>
					<Button onClick={closeLogDetails} size='lg'>
						{t('general.close')}
					</Button>
				</div>
			</Modal>
		</>
	);
}
