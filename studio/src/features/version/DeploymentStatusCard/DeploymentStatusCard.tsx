import {
	DeploymentLogsDrawer,
	DeploymentSettings,
	LastDeployment,
	Resources,
} from '@/features/version/DeploymentStatusCard/index.ts';
import { cn } from '@/utils';
import { GearSix } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Button } from 'components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel } from 'components/Dropdown';
import { ScrollArea, ScrollBar } from 'components/ScrollArea';
import { useAnimate } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './deploymentStatusCard.scss';

const logs = [
	{
		id: 1,
		user: {
			name: 'John Doe',
			profilePicture: '',
			color: '#fff',
		},
		description: 'Depoyed version to its environment',
		status: 'Good',
		date: new Date(),
	},
	{
		id: 2,
		user: {
			name: 'John Doe',
			profilePicture: '',
			color: '#fff',
		},
		description: 'Depoyed version to its environment',
		status: 'Error',
		date: new Date(),
	},
	{
		id: 3,
		user: {
			name: 'John Doe',
			color: '#fff',
			profilePicture: '',
		},
		description: 'Depoyed version to its environment',
		status: 'Good',
		date: new Date(),
	},
];

interface DeploymentStatusCardProps {
	triggerIcon: ReactNode;
}

export default function DeploymentStatusCard({ triggerIcon }: DeploymentStatusCardProps) {
	const { t } = useTranslation();
	const [settingsIsOpen, setSettingsIsOpen] = useState(false);
	const [scope, animate] = useAnimate();
	const [isLogsOpen, setIsLogsOpen] = useState(false);

	useEffect(() => {
		if (!scope.current) return;
		animate(scope.current, { height: settingsIsOpen ? '420px' : 'auto' });
	}, [settingsIsOpen]);

	return (
		<>
			<DropdownMenu onOpenChange={(open) => !open && setSettingsIsOpen(false)}>
				<DropdownMenuPrimitive.Trigger asChild>
					<Button variant='blank'>{triggerIcon}</Button>
				</DropdownMenuPrimitive.Trigger>
				<DropdownMenuContent ref={scope} className={cn('overflow-hidden relative')}>
					<DropdownMenuLabel className='relative flex justify-between items-center'>
						<span className='pr-10 truncate'>{t('version.deployment_status')}</span>
						<Button
							onClick={() => setSettingsIsOpen((prev) => !prev)}
							variant='blank'
							iconOnly
							rounded
							className='absolute hover:bg-subtle right-4 p-0 aspect-square'
						>
							<GearSix size={20} />
						</Button>
					</DropdownMenuLabel>
					<ScrollArea className='h-[500px]'>
						<ScrollBar orientation='vertical' />
						<div className='deployment-status-content'>
							<LastDeployment />
							<Resources />
						</div>
					</ScrollArea>
					<DeploymentSettings isOpen={settingsIsOpen} close={() => setSettingsIsOpen(false)} />
					<footer className='deployment-status-footer'>
						<Button onClick={() => setIsLogsOpen(true)} variant='link'>
							{t('version.view_logs')}
						</Button>
					</footer>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeploymentLogsDrawer logs={logs} open={isLogsOpen} onOpenChange={setIsLogsOpen} />
		</>
	);
}
