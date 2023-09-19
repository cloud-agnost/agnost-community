import { ENV_STATUS_CLASS_MAP } from '@/constants';
import {
	DeploymentLogsDrawer,
	DeploymentSettings,
	LastDeployment,
	Resources,
} from '@/features/version/DeploymentStatusCard/index.ts';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { cn } from '@/utils';
import { Cloud, GearSix } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Button } from 'components/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel } from 'components/Dropdown';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './deploymentStatusCard.scss';
export default function DeploymentStatusCard() {
	const { t } = useTranslation();
	const [settingsIsOpen, setSettingsIsOpen] = useState(false);
	const [isLogsOpen, setIsLogsOpen] = useState(false);
	const { envStatus } = useEnvironmentStore();
	const classes = ENV_STATUS_CLASS_MAP[envStatus];
	return (
		<>
			<DropdownMenu onOpenChange={(open) => !open && setSettingsIsOpen(false)}>
				<DropdownMenuPrimitive.Trigger asChild>
					<Button variant='blank' iconOnly className='relative'>
						<div className='absolute top-1 right-0.5'>
							<span className='relative flex items-center justify-center h-3 w-3'>
								<span
									className={cn(
										'animate-ping absolute inline-flex h-full w-full rounded-full ',
										classes[0],
									)}
								/>
								<span className={cn('relative inline-flex rounded-full h-2 w-2', classes[1])} />
							</span>
						</div>
						<Cloud size={24} />
					</Button>
				</DropdownMenuPrimitive.Trigger>
				<DropdownMenuContent className={cn('overflow-hidden relative p-4 w-[21rem] space-y-6')}>
					<DropdownMenuLabel className='relative flex justify-between items-center p-0'>
						<span className='truncate text-default'>{t('version.deployment_status')}</span>
						<Button
							onClick={() => setSettingsIsOpen((prev) => !prev)}
							variant='blank'
							iconOnly
							rounded
							className='hover:bg-subtle aspect-square'
						>
							<GearSix size={20} />
						</Button>
					</DropdownMenuLabel>
					<div className='deployment-status-content'>
						<LastDeployment />
						<Resources />
					</div>

					<DeploymentSettings isOpen={settingsIsOpen} close={() => setSettingsIsOpen(false)} />
					<footer className='deployment-status-footer'>
						<Button onClick={() => setIsLogsOpen(true)} variant='link'>
							{t('version.view_logs')}
						</Button>
					</footer>
				</DropdownMenuContent>
			</DropdownMenu>
			<DeploymentLogsDrawer open={isLogsOpen} onOpenChange={setIsLogsOpen} />
		</>
	);
}
