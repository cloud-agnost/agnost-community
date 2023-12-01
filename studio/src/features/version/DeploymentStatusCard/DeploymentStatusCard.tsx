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

import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './deploymentStatusCard.scss';
import { useEnvironmentStatus } from '@/hooks';
import { EnvironmentStatus } from '@/types';

export default function DeploymentStatusCard() {
	const { t } = useTranslation();
	const [settingsIsOpen, setSettingsIsOpen] = useState(false);
	const [isLogsOpen, setIsLogsOpen] = useState(false);
	const { getEnvironmentResources, environment } = useEnvironmentStore();
	const envStatus = useEnvironmentStatus();
	const classes = ENV_STATUS_CLASS_MAP[envStatus as EnvironmentStatus];

	function handleOpenChange(open: boolean) {
		if (!open) {
			setSettingsIsOpen(false);
		} else {
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
		}
	}
	return (
		<>
			<DropdownMenu onOpenChange={(open) => handleOpenChange(open)}>
				<DropdownMenuTrigger asChild>
					<Button variant='blank' iconOnly className='relative'>
						<div className='absolute top-1 right-0.5'>
							<span className='relative flex items-center justify-center h-3 w-3'>
								<span
									className={cn(
										'animate-ping absolute inline-flex h-full w-full rounded-full ',
										classes?.[0],
									)}
								/>
								<span className={cn('relative inline-flex rounded-full h-2 w-2', classes?.[1])} />
							</span>
						</div>
						<Cloud size={24} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className={cn('overflow-hidden relative w-[21rem]', settingsIsOpen && 'h-[24rem]')}
					align='end'
				>
					<DropdownMenuLabel className='relative flex justify-between items-center px-4 py-2'>
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
					<footer className='deployment-status-footer p-4'>
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
