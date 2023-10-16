import { Agnost } from '@/components/icons';
import { MENU_ITEMS } from '@/constants';
import { ApplicationSelectDropdown } from '@/features/application';
import { OrganizationDropdown } from '@/features/organization/OrganizationDropdown';
import { DeploymentStatusCard } from '@/features/version/DeploymentStatusCard';
import { VersionDropdown } from '@/features/version/VersionDropdown';
import { CaretRight } from '@phosphor-icons/react';

import { AuthUserDropdown } from '@/features/auth/AuthUserDropdown';
import { Notification } from '@/features/version/Notification';
import { Link, useParams } from 'react-router-dom';
import Feedback from './Feedback';
import './header.scss';

export function Header() {
	const { versionId, appId } = useParams();

	return (
		<header className='header-menu'>
			<div className='header-menu-left'>
				<Link to='/' className='header-menu-left-logo'>
					<Agnost width='40' height='40' />
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
					<Feedback />
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
					{versionId && (
						<>
							<div className='header-menu-right-actions-versions'>
								<DeploymentStatusCard />
							</div>
							<div className='header-menu-right-actions-notification'>
								<Notification />
							</div>
						</>
					)}

					<div className='header-menu-right-actions-user'>
						<AuthUserDropdown />
					</div>
				</div>
			</div>
		</header>
	);
}
