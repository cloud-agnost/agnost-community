import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
} from 'components/Dropdown';
import { Button } from 'components/Button';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import useVersionStore from '@/store/version/versionStore.ts';
import { useLocation, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';

interface TabOptionsDropdownProps {
	getDashboardPath: () => string;
}
export default function TabOptionsDropdown({ getDashboardPath }: TabOptionsDropdownProps) {
	const { t } = useTranslation();
	const { removeAllTabs, currentTab, tabs, removeTab, removeAllTabsExcept } = useVersionStore();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const tabOptions = [
		{
			title: t('version.close_selected_tab'),
			action: () => {
				if (!currentTab) return;
				const redirectPath = removeTab(currentTab.id);
				const path = redirectPath ?? getDashboardPath();

				setTimeout(() => {
					navigate(path);
				}, 1);
			},
			disabled: pathname === getDashboardPath(),
		},
		{
			title: t('version.close_all_tabs_except_current'),
			action: () => {
				if (!currentTab) return;
				removeAllTabsExcept(currentTab?.id);
			},
			disabled: pathname === getDashboardPath(),
		},
		{
			title: t('version.close_all_tabs'),
			action: () => {
				removeAllTabs();
				navigate(getDashboardPath());
			},
			disabled: tabs.length === 0,
		},
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button rounded variant='blank' iconOnly>
					<DotsThreeVertical size={15} weight='bold' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='tab-options-dropdown-content'>
				<DropdownMenuItemContainer>
					{tabOptions.map((option, index) => (
						<Fragment key={index}>
							<DropdownMenuItem disabled={option.disabled} onClick={option.action}>
								{option.title}
							</DropdownMenuItem>
							{index === 0 && <DropdownMenuSeparator />}
						</Fragment>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
