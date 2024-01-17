import { Button } from '@/components/Button';
import React from 'react';

import { cn } from '@/utils';
import { useTabIcon } from '@/hooks';
import { TabTypes } from '@/types';

interface SideBarButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	active: boolean;
	className?: string;
	children?: React.ReactNode;
	asChild?: boolean;
	type?: TabTypes;
	title?: string;
}

export default function SideBarButton({
	active,
	className,
	children,
	title,
	type,
	asChild,
	...props
}: SideBarButtonProps) {
	const getIcon = useTabIcon('w-5 h-5');
	return (
		<Button
			variant='blank'
			size='full'
			className={cn(
				active ? 'bg-button-primary/50' : 'hover:bg-wrapper-background-hover',
				'justify-start text-left gap-2 text-sm  font-normal cursor-pointer !h-7 !rounded-none',
				className,
			)}
			{...props}
		>
			<div className={cn('flex items-center gap-1 px-4 w-full', !active && '[&>svg]:!text-subtle')}>
				{!asChild ? (
					<>
						{getIcon(type as TabTypes)}
						<h1 title={title} className='flex-1 truncate'>
							{title}
						</h1>
					</>
				) : (
					children
				)}
			</div>
		</Button>
	);
}
