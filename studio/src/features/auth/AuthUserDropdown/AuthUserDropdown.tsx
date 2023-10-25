import { LineSegments } from '@/components/icons';
import useAuthStore from '@/store/auth/authStore.ts';
import useThemeStore from '@/store/theme/themeStore.ts';
import { cn } from '@/utils';
import { GearSix, Laptop, MoonStars, SignOut, SunDim } from '@phosphor-icons/react';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './AuthUserDropdown.scss';
import { useNavigate } from 'react-router-dom';
import { resetAllStores } from '@/helpers';
export default function AuthUserDropdown() {
	const { user, logout } = useAuthStore();
	const { t } = useTranslation();
	const { setTheme, theme } = useThemeStore();
	const navigate = useNavigate();
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

	function logoutHandler() {
		logout({
			onSuccess: () => {
				navigate('/login');
				resetAllStores();
			},
		});
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<AuthUserAvatar size='sm' />
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-[210px] p-1' align='end'>
				<DropdownMenuLabel className='p-3 gap-2 flex flex-col items-center justify-center'>
					<AuthUserAvatar size='md' />
					<div className='font-normal text-center -space-y-1'>
						<div className='text-sm text-default leading-6'>{user?.name}</div>
						<div className='text-[11px] text-subtle leading-[21px]'>{user?.contactEmail}</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				<DropdownMenuItemContainer className='space-y-2'>
					<DropdownMenuItem asChild>
						<Link className={cn('flex items-center gap-2')} to='/profile/settings'>
							<GearSix className='text-icon-base text-lg' />
							{t('general.account_settings')}
						</Link>
					</DropdownMenuItem>
					{user?.isClusterOwner && (
						<DropdownMenuItem asChild>
							<Link
								className={cn('flex items-center gap-2')}
								to={'/profile/settings/cluster-management'}
							>
								<LineSegments className='text-icon-base text-lg' />
								{t('profileSettings.clusters_title')}
							</Link>
						</DropdownMenuItem>
					)}

					<DropdownMenuSub>
						<DropdownMenuSubTrigger className='dropdown-item flex items-center gap-2'>
							<SunDim className='text-icon-base text-lg' />
							Theme
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent
								className='dropdown-content data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade'
								sideOffset={2}
								alignOffset={-5}
							>
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
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuItemContainer>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className='flex text-sm text-default leading-6 font-normal items-center gap-2'
					onClick={logoutHandler}
				>
					<span className='w-6 h-6 flex items-center justify-center'>
						<SignOut className='text-icon-base text-lg' />
					</span>
					{t('general.logout')}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
