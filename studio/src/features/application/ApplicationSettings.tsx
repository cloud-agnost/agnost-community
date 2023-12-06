import { Button } from '@/components/Button';
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
	appName: string;
	role: AppRoles;
}

export default function ApplicationSettings({ appId, role }: ApplicationSettingsProps) {
	const { applications } = useApplicationStore();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='text' rounded className='p-2' onClick={(e) => e.stopPropagation()}>
					<DotsThreeVertical className='w-5 h-5 text-icon-secondary' />
					<span className='sr-only'>Open popover</span>
				</Button>
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
