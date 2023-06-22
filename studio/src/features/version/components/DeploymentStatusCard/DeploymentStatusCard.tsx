import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils';
import { Button } from 'components/Button';
import { ReactNode } from 'react';
import './deploymentStatusCard.scss';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { useTranslation } from 'react-i18next';

interface DeploymentStatusCardProps {
	triggerIcon: ReactNode;
}

export default function DeploymentStatusCard({ triggerIcon }: DeploymentStatusCardProps) {
	const { t } = useTranslation();
	return (
		<DropdownMenu>
			<DropdownMenuPrimitive.Trigger asChild>
				<Button variant='blank'>{triggerIcon}</Button>
			</DropdownMenuPrimitive.Trigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>{t('version.deployment_status')}</DropdownMenuLabel>
				<div className='deployment-status-content'>
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
