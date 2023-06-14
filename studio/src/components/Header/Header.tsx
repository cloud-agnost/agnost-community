import './header.scss';
import { Link } from 'react-router-dom';
import { LightBulb, ChangeLog, AgnostOnlyLogo } from '@/components/icons';
import { FileText, Cloud, Bell } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import useAuthStore from '@/store/auth/authStore.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';

const menuItems = [
	{
		title: 'Feedback',
		url: '/feedback',
		icon: <LightBulb />,
	},
	{
		title: 'Change Log',
		url: '/change-log',
		icon: <ChangeLog />,
	},
	{
		title: 'Docs',
		url: '/docs',
		icon: <FileText />,
	},
];

export function Header() {
	const { user } = useAuthStore();
	return (
		<header className='header-menu'>
			<div className='header-menu-left'>
				<Link to='/' className='header-menu-left-logo'>
					<AgnostOnlyLogo width='40' height='40' />
				</Link>
				<div className='header-menu-divider' />
				<div className='header-menu-left-organization-select'>Organization Select Dropdown</div>
			</div>
			<div className='header-menu-right'>
				<nav className='header-menu-right-nav'>
					{menuItems.map((item, index) => (
						<Link className='header-menu-right-nav-item' key={index} to={item.url}>
							<span className='header-menu-right-nav-item-icon'>{item.icon}</span>
							<span className='header-menu-right-nav-item-title'>{item.title}</span>
						</Link>
					))}
				</nav>
				<div className='header-menu-divider' />
				<div className='header-menu-right-actions'>
					<div className='header-menu-right-actions-versions'>
						<Button variant='icon'>
							<Cloud />
						</Button>
					</div>
					<div className='header-menu-right-actions-notification'>
						<Button variant='icon'>
							<Bell />
						</Button>
					</div>
					<div className='header-menu-right-actions-user'>
						<Link to='/profile' className='header-menu-right-actions-user-avatar'>
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
