import { Button } from '@/components/Button';
import { Command, CommandGroup, CommandItem, CommandSeparator } from '@/components/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { APPLICATION_SETTINGS } from '@/constants';
import { useToast } from '@/hooks';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { AppRoles, Application } from '@/types';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ApplicationSettingsProps {
	appId: string;
	appName: string;
	role: AppRoles;
}

export default function ApplicationSettings({ appId, appName, role }: ApplicationSettingsProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canAppDelete = useAuthorizeApp({ role, key: 'delete' });
	const { organization } = useOrganizationStore();
	const { notify } = useToast();
	const { applications, openDeleteModal, openLeaveModal } = useApplicationStore();
	const HAS_PERMISSION: Record<string, boolean> = {
		update: useAuthorizeApp({ role, key: 'update' }),
		'invite.create': useAuthorizeApp({ role, key: 'invite.create' }),
		'version.view': useAuthorizeApp({ role, key: 'version.view' }),
	};
	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='text'
						rounded
						className='p-2'
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<DotsThreeVertical className='w-5 h-5 text-icon-secondary' />
						<span className='sr-only'>Open popover</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[181px]'>
					<Command>
						<CommandGroup>
							{APPLICATION_SETTINGS.map((setting) => (
								<CommandItem
									id={setting.id}
									key={setting.name}
									disabled={!HAS_PERMISSION[setting.permissionKey]}
									onSelect={() => {
										setOpen(false);
										if (setting.onClick)
											setting.onClick(applications.find((app) => app._id === appId) as Application);
									}}
									className='font-sfCompact px-3'
								>
									{setting.name}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								id='leave-app'
								disabled={role === 'Admin'}
								onSelect={() => {
									setOpen(false);
									openLeaveModal(applications.find((app) => app._id === appId) as Application);
								}}
								className='font-sfCompact px-3'
							>
								{t('application.settings.leaveTeam')}
							</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								id='delete-app'
								disabled={!canAppDelete}
								onSelect={() => {
									setOpen(false);
									openDeleteModal(applications.find((app) => app._id === appId) as Application);
								}}
								className='font-sfCompact px-3'
							>
								{t('general.delete')}
							</CommandItem>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</>
	);
}
