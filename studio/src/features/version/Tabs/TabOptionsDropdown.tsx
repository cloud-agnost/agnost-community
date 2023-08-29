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
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Fragment } from 'react';
import useTabStore from '@/store/version/tabStore.ts';

interface TabOptionsDropdownProps {
	getDashboardPath: () => string;
}
export default function TabOptionsDropdown({ getDashboardPath }: TabOptionsDropdownProps) {
	const { t } = useTranslation();
	const {
		removeAllTabs,
		getCurrentTab,
		getTabsByVersionId,
		removeTab,
		removeAllTabsExcept,
		getPreviousTab,
	} = useTabStore();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { versionId } = useParams() as { versionId: string };

	const currentTab = getCurrentTab(versionId);

	const tabs = getTabsByVersionId(versionId);

	const tabOptions = [
		{
			title: t('version.close_selected_tab'),
			action: () => {
				if (!currentTab) return;
				const redirectTab = getPreviousTab(versionId, currentTab.id);
				removeTab(versionId, currentTab.id);
				setTimeout(() => {
					if (redirectTab) navigate(redirectTab.path);
				}, 1);
			},
			disabled: pathname.split('?')[0] === getDashboardPath(),
		},
		{
			title: t('version.close_all_tabs_except_current'),
			action: () => {
				if (!currentTab) return;
				removeAllTabsExcept(versionId);
			},
			disabled: tabs.filter((tab) => !tab.isDashboard).length < 2,
		},
		{
			title: t('version.close_all_tabs'),
			action: () => {
				removeAllTabs(versionId);
				navigate(getDashboardPath());
			},
			disabled: tabs.length < 2,
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
