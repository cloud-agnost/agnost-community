import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils';
import { Button } from 'components/Button';
import { ReactNode, useState } from 'react';
import './deploymentStatusCard.scss';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { useTranslation } from 'react-i18next';
import { GearSix } from '@phosphor-icons/react';
import { DeploymentSettings } from '@/features/version/components/DeploymentStatusCard/';

interface DeploymentStatusCardProps {
	triggerIcon: ReactNode;
}

export default function DeploymentStatusCard({ triggerIcon }: DeploymentStatusCardProps) {
	const { t } = useTranslation();
	const [settingsIsOpen, setSettingsIsOpen] = useState(false);
	return (
		<DropdownMenu>
			<DropdownMenuPrimitive.Trigger asChild>
				<Button variant='blank'>{triggerIcon}</Button>
			</DropdownMenuPrimitive.Trigger>
			<DropdownMenuContent className='overflow-hiddenr relative'>
				<DropdownMenuLabel className='relative flex justify-between items-center'>
					<span className='pr-10 truncate'>{t('version.deployment_status')}</span>
					<Button
						onClick={() => setSettingsIsOpen((prev) => !prev)}
						variant='blank'
						iconOnly
						rounded
						className='absolute hover:bg-subtle right-4 p-0 w-8 h-8'
					>
						<GearSix size={20} />
					</Button>
				</DropdownMenuLabel>
				<div className='deployment-status-content'>
					<DeploymentSettings isOpen={settingsIsOpen} close={() => setSettingsIsOpen(false)} />
					<AuthUserAvatar size='xl' />
					<p className='font-sfCompact text-sm text-default leading-6'>
						{t('version.deployment_status_empty')}
					</p>
					<Button>{t('version.deploy')}</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn('deployment-status', className)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn('deployment-status-title', className)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
