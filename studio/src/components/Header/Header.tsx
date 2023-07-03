import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { AgnostOnlyLogo } from '@/components/icons';
import useAuthStore from '@/store/auth/authStore.ts';
import { Bell, Cloud } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import './header.scss';
import { MENU_ITEMS } from '@/constants';
import { OrganizationDropdown } from '@/features/Organization/OrganizationDropdown';
import { DeploymentStatusCard } from '@/features/version/components/DeploymentStatusCard';

export function Header() {
	const { user } = useAuthStore();
	return (
		<header className='header-menu'>
			<div className='header-menu-left'>
				<Link to='/' className='header-menu-left-logo'>
					<AgnostOnlyLogo width='40' height='40' />
				</Link>
				<div className='header-menu-divider' />
				<OrganizationDropdown />
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
					<div className='header-menu-right-actions-user'>
						<Link to='/profile/settings' className='header-menu-right-actions-user-avatar'>
							<Avatar size='sm'>
								<AvatarImage src='https://avatars.githubusercontent.com/u/1500684?s=400&u=3a3d2f8d7d1b5c2b5f5d9f3e3b9e5f6f8b0c9b8a&v=4' />
								{user && <AvatarFallback color={user?.color} name={user?.name} />}
							</Avatar>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
