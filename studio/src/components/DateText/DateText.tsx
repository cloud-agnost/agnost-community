import { ReactNode } from 'react';
import { cn, formatDate } from '@/utils';

interface DateTextProps {
	date: string | Date;
	children: ReactNode;
	className?: string;
}
export default function DateText({ date, children, className }: DateTextProps) {
	return (
		<div className={cn('flex items-center gap-2', className)}>
			{children}
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
