import { VERSION_SETTINGS_MENU_ITEMS } from 'constants/constants.ts';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './settingsNavbar.scss';

export default function SettingsNavbar() {
	const { t } = useTranslation();
	return (
		<div className='version-settings-navbar'>
			<h4 className='version-settings-navbar-title'>{t('version.settings.default')}</h4>
			<nav>
				{VERSION_SETTINGS_MENU_ITEMS.map((item) => {
					return (
						<NavLink end key={item.path} to={item.path}>
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
