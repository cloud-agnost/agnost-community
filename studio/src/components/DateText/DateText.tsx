import { ReactNode } from 'react';
import { cn, formatDate } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { OrganizationMember } from '@/types';
interface DateTextProps {
	date: string | Date;
	children?: ReactNode;
	className?: string;
	user?: OrganizationMember;
	style?: React.CSSProperties;
}
export default function DateText({ date, children, className, user, ...props }: DateTextProps) {
	return (
		<div className={cn('flex items-center gap-4 whitespace-nowrap', className)} {...props}>
			{children}
			{user && (
				<Avatar size='sm'>
					<AvatarImage src={user.member.pictureUrl} />
					<AvatarFallback isUserAvatar color={user.member?.color} name={user.member?.name} />
				</Avatar>
			)}
			<div>
				<span className='block text-default text-sm leading-6'>
					{formatDate(date, {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					})}
				</span>
				<time className='text-[11px] text-subtle leading-[21px]'>
					{formatDate(date, {
						hour: 'numeric',
						minute: 'numeric',
					})}
				</time>
			</div>
		</div>
	);
}
