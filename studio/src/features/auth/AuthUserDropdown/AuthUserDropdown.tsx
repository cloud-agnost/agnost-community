import './AuthUserDropdown.scss';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore.ts';
import { Fragment } from 'react';
import { cn } from '@/utils';
import { HEADER_USER_DROPDOWN } from '@/constants';

export default function AuthUserDropdown() {
	const user = useAuthStore((state) => state.user);

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
				{HEADER_USER_DROPDOWN.map((item, index) => {
					const content = (
						<span
							className={cn('flex text-sm text-default leading-6 font-normal items-center gap-2')}
						>
							<span className='w-6 h-6 flex items-center justify-center'>
								<item.Icon className={cn('text-icon-base', item.iconClassName)} />
							</span>
							{item.title}
						</span>
					);
					return (
						<Fragment key={index}>
							{item.beforeHasSeparator && <DropdownMenuSeparator />}
							<DropdownMenuItem onClick={item.action} asChild>
								{item.url ? (
									<Link className={cn('flex items-center gap-2')} to={item.url}>
										{content}
									</Link>
								) : (
									content
								)}
							</DropdownMenuItem>
						</Fragment>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
