import { Button } from '@/components/Button';
import { AgnostOnlyLogo } from '@/components/icons';
import { Bell, Cloud } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import './header.scss';
import { MENU_ITEMS } from '@/constants';
import { OrganizationDropdown } from '@/features/Organization/OrganizationDropdown';
import { DeploymentStatusCard } from '@/features/version/components/DeploymentStatusCard';
import { AuthUserAvatar } from 'components/AuthUserAvatar';

export function Header() {
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
							<AuthUserAvatar size='sm' />
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
