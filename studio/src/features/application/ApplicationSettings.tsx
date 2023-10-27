import { Button } from '@/components/Button';
import { APPLICATION_SETTINGS } from '@/constants';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore.ts';
import { AppRoles, Application } from '@/types';
import { DotsThreeVertical } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ApplicationSettingsProps {
	appId: string;
	appName: string;
	role: AppRoles;
}

export default function ApplicationSettings({ appId, role }: ApplicationSettingsProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const canAppDelete = useAuthorizeApp({ role, key: 'delete' });
	const { applications, openDeleteModal, openLeaveModal } = useApplicationStore();
	const HAS_PERMISSION: Record<string, boolean> = {
		update: useAuthorizeApp({ role, key: 'update' }),
		'invite.create': useAuthorizeApp({ role, key: 'invite.create' }),
		'version.view': useAuthorizeApp({ role, key: 'version.view' }),
	};
	return (
		<>
			<DropdownMenu open={open} onOpenChange={() => setOpen(false)}>
				<DropdownMenuTrigger asChild>
					<Button
						variant='text'
						rounded
						className='p-2'
						onClick={(e) => {
							setOpen(!open);
							e.stopPropagation();
						}}
					>
						<DotsThreeVertical className='w-5 h-5 text-icon-secondary' />
						<span className='sr-only'>Open popover</span>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end' className='version-dropdown-content'>
					<DropdownMenuItemContainer>
						{APPLICATION_SETTINGS.map((setting) => (
							<DropdownMenuItem
								id={setting.id}
								key={setting.name}
								disabled={!HAS_PERMISSION[setting.permissionKey]}
								onClick={() => {
									setOpen(false);
									if (setting.onClick)
										setting.onClick(applications.find((app) => app._id === appId) as Application);
								}}
								className='font-sfCompact px-3'
							>
								{setting.name}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem
								id='leave-app'
								disabled={role === 'Admin'}
								onSelect={() => {
									setOpen(false);
									openLeaveModal(applications.find((app) => app._id === appId) as Application);
								}}
								className='font-sfCompact px-3'
							>
								{t('application.settings.leaveTeam')}
							</DropdownMenuItem>
							<DropdownMenuItem
								id='delete-app'
								disabled={!canAppDelete}
								onSelect={() => {
									setOpen(false);
									openDeleteModal(applications.find((app) => app._id === appId) as Application);
								}}
								className='font-sfCompact px-3'
							>
								{t('general.delete')}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
