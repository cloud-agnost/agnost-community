import { Button } from '@/components/Button';
import { AgnostOnlyLogo } from '@/components/icons';
import { MENU_ITEMS } from '@/constants';
import { OrganizationDropdown } from '@/features/Organization/OrganizationDropdown';
import { ApplicationSelectDropdown } from '@/features/application';
import { DeploymentStatusCard } from '@/features/version/DeploymentStatusCard';
import { VersionDropdown } from '@/features/version/VersionDropdown';
import useApplicationStore from '@/store/app/applicationStore';
import { Bell, CaretRight, Cloud } from '@phosphor-icons/react';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Link, useParams } from 'react-router-dom';
import './header.scss';

export function Header() {
	const { application } = useApplicationStore();
	const { versionId } = useParams();

	return (
		<header className='header-menu'>
			<div className='header-menu-left'>
				<Link to='/' className='header-menu-left-logo'>
					<AgnostOnlyLogo width='40' height='40' />
				</Link>
				<div className='header-menu-divider' />
				<div className='flex items-center gap-2'>
					<OrganizationDropdown />
					{application && (
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
