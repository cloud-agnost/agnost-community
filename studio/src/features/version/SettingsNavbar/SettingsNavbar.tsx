import { VERSION_SETTINGS_MENU_ITEMS } from 'constants/constants.ts';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './settingsNavbar.scss';
import useTabStore from '@/store/version/tabStore';
import { useParams } from 'react-router-dom';
import useVersionStore from '@/store/version/versionStore';
export default function SettingsNavbar() {
	const { t } = useTranslation();
	const { updateCurrentTab, getCurrentTab } = useTabStore();
	const { versionId } = useParams<{ versionId: string }>();
	const { getVersionDashboardPath } = useVersionStore();
	function handleTabChange(item = VERSION_SETTINGS_MENU_ITEMS[0]) {
		const tab = getCurrentTab(versionId as string);
		const url = getVersionDashboardPath(`settings/${item.path}`);
		updateCurrentTab(versionId as string, {
			...tab,
			path: `${url}?tabId=${tab.id}`,
			title: item.title,
		});
	}

	return (
		<div className='version-settings-navbar'>
			<h4 className='version-settings-navbar-title'>{t('version.settings.default')}</h4>
			<nav>
				{VERSION_SETTINGS_MENU_ITEMS.map((item) => {
					return (
						<NavLink end key={item.path} to={item.path} onClick={() => handleTabChange(item)}>
							<span className='flex items-center justify-center text-xl w-6 h-6'>
								<item.icon className='text-icon-base' />
							</span>
							{item.title}
						</NavLink>
					);
				})}
			</nav>
		</div>
	);
}
