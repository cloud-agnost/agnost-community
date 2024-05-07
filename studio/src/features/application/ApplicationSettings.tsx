import { APPLICATION_SETTINGS } from '@/constants';
import useApplicationStore from '@/store/app/applicationStore.ts';
import { AppRoles, Application } from '@/types';
import { DotsThreeVertical } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';

interface ApplicationSettingsProps {
	appId: string;
	role: AppRoles;
}

export default function ApplicationSettings({ appId, role }: ApplicationSettingsProps) {
	const { applications } = useApplicationStore();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
				<div className='size-7 hover:bg-wrapper-background-hover rounded-full flex items-center justify-center cursor-pointer'>
					<DotsThreeVertical className='size-5 text-icon-secondary' />
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='end'
				className='version-dropdown-content'
				onClick={(e) => e.stopPropagation()}
			>
				<DropdownMenuItemContainer>
					{APPLICATION_SETTINGS.map((setting, index) => (
						<div key={setting.id}>
							<DropdownMenuItem
								id={setting.id}
								disabled={setting.isDisabled(
									role,
									applications.find((app) => app._id === appId) as Application,
								)}
								className='font-sfCompact px-3'
								onClick={() =>
									setting.onClick(applications.find((app) => app._id === appId) as Application)
								}
							>
								<setting.icon className='w-5 h-5 mr-2' />
								{setting.name}
							</DropdownMenuItem>
							{index === APPLICATION_SETTINGS.length - 3 && (
								<DropdownMenuSeparator key={setting.name} />
							)}
						</div>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
