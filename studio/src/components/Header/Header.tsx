import { Agnost } from '@/components/icons';
import { MENU_ITEMS } from '@/constants';
import { ApplicationSelectDropdown } from '@/features/application';
import { AuthUserDropdown } from '@/features/auth/AuthUserDropdown';
import { ReleaseDropdown } from '@/features/cluster';
import { OrganizationDropdown } from '@/features/organization/OrganizationDropdown';
import { DeploymentStatusCard } from '@/features/version/DeploymentStatusCard';
import { NotificationDropdown } from '@/features/version/Notification';
import { VersionDropdown } from '@/features/version/VersionDropdown';
import { useAuthorizeVersion } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../Button';
import { Separator } from '../Separator';
import Feedback from './Feedback';
import './header.scss';

export function Header() {
	const { versionId, appId, orgId } = useParams();
	const { toggleSearchCommandMenu } = useVersionStore();
	const canViewNotf = useAuthorizeVersion('viewLogs');
	return (
		<header className='header-menu'>
			<div className='header-menu-left'>
				<Link to='/'>
					<Agnost width='36' height='36' />
				</Link>
				<Separator orientation='vertical' className='h-8 transform rotate-12' />
				<div className='flex items-center gap-4'>
					{orgId && <OrganizationDropdown />}
					{appId && (
						<>
							<Separator orientation='vertical' className='h-8 transform rotate-12' />
							<ApplicationSelectDropdown />
						</>
					)}
					{versionId && (
						<>
							<Separator orientation='vertical' className='h-8 transform rotate-12' />
							<VersionDropdown />
						</>
					)}
				</div>
			</div>
			<div className='header-menu-right'>
				<nav className='header-menu-right-nav'>
					<Feedback />
					{MENU_ITEMS.map((item) => (
						<Button
							key={item.title}
							variant='blank'
							className='header-menu-right-nav-item text-subtle'
							onClick={() => {
								window.open(item.url, '_blank', 'noreferrer');
							}}
						>
							<item.icon className='header-menu-right-nav-item-icon' />

							<span className='header-menu-right-nav-item-title font-sfCompact'>{item.title}</span>
						</Button>
					))}
				</nav>
				<div className='header-menu-divider' />
				<div className='header-menu-right-actions'>
					<Button variant='icon' onClick={toggleSearchCommandMenu}>
						<MagnifyingGlass size={18} />
					</Button>
					<ReleaseDropdown />
					{versionId && (
						<>
							<DeploymentStatusCard />
							{canViewNotf && <NotificationDropdown />}
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
