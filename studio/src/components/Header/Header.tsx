import { Button } from '@/components/Button';
import { AgnostOnlyLogo } from '@/components/icons';
import { MENU_ITEMS } from '@/constants';
import { OrganizationDropdown } from '@/features/organization/OrganizationDropdown';
import { ApplicationSelectDropdown } from '@/features/application';
import { DeploymentStatusCard } from '@/features/version/DeploymentStatusCard';
import { VersionDropdown } from '@/features/version/VersionDropdown';
import { Bell, CaretRight, Cloud } from '@phosphor-icons/react';
import { Link, useParams } from 'react-router-dom';
import './header.scss';
import AuthUserDropdown from '../../features/auth/AuthUserDropdown/AuthUserDropdown.tsx';
import { MoonStars, SunDim, Laptop } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuItemContainer,
} from 'components/Dropdown';
import useThemeStore from '@/store/theme/themeStore.ts';
import { cn } from '@/utils';

export function Header() {
	const { versionId, appId } = useParams();

	return (
		<header className='header-menu'>
			<div className='header-menu-left'>
				<Link to='/' className='header-menu-left-logo'>
					<AgnostOnlyLogo width='40' height='40' />
				</Link>
				<div className='header-menu-divider' />
				<div className='flex items-center gap-2'>
					<OrganizationDropdown />
					{appId && (
						<>
							<CaretRight size={20} className='text-icon-disabled' />
							<ApplicationSelectDropdown />
						</>
					)}
					{versionId && (
						<>
							<CaretRight size={20} className='text-icon-disabled' />
							<VersionDropdown />
						</>
					)}
				</div>
			</div>
			<div className='header-menu-right'>
				<nav className='header-menu-right-nav'>
					{MENU_ITEMS.map((item, index) => (
						<Link className='header-menu-right-nav-item' key={index} to={item.url}>
							<span className='header-menu-right-nav-item-icon'>
								<item.icon />
							</span>
							<span className='header-menu-right-nav-item-title'>{item.title}</span>
						</Link>
					))}
				</nav>
				<div className='header-menu-divider' />
				<div className='header-menu-right-actions'>
					<div className='header-menu-right-actions-versions'>
						<DeploymentStatusCard triggerIcon={<Cloud />} />
					</div>
					<div className='header-menu-right-actions-notification'>
						<Button variant='blank'>
							<Bell />
						</Button>
					</div>
					<ThemeChanger />
					<div className='header-menu-right-actions-user'>
						<AuthUserDropdown />
					</div>
				</div>
			</div>
		</header>
	);
}

function ThemeChanger() {
	const { setTheme, theme } = useThemeStore();

	const THEMES = [
		{
			id: 'light',
			title: 'Light',
			icon: <SunDim size={24} />,
		},
		{
			id: 'dark',
			title: 'Dark',
			icon: <MoonStars size={24} />,
		},
		{
			id: 'system',
			title: 'System',
			icon: <Laptop size={24} />,
		},
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button rounded variant='blank' iconOnly>
					<SunDim size={17} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItemContainer>
					{THEMES.map((t) => (
						<DropdownMenuItem
							onClick={() => setTheme(t.id)}
							asChild
							key={t.id}
							className={cn({
								' text-brand-primary': t.id === theme,
							})}
						>
							<span className='flex items-center gap-2'>
								{t.icon}
								{t.title}
							</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
