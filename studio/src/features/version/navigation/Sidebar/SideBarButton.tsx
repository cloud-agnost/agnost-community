import { Button } from '@/components/Button';
import React from 'react';

import { cn } from '@/utils';
import { useTabIcon } from '@/hooks';
import { TabTypes } from '@/types';

interface SideBarButtonProps extends React.HTMLAttributes<HTMLDivElement> {
	active: boolean;
	className?: string;
	children?: React.ReactNode;
	actions?: React.ReactNode;
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
	actions,
	asChild,
	...props
}: SideBarButtonProps) {
	const getIcon = useTabIcon('w-3.5 h-3.5');
	return (
		<div
			className={cn(
				'flex items-center [&>*]:min-w-0 justify-between gap-1 group',
				active
					? 'bg-button-primary/70 text-default'
					: 'hover:bg-subtle text-subtle hover:text-default',
			)}
			{...props}
		>
			<Button
				variant='blank'
				size='full'
				className={cn(
					'justify-start text-left gap-2 text-xs  font-normal cursor-pointer !h-6 !rounded-none whitespace-nowrap  pl-5 flex-1',
					className,
				)}
			>
				{!asChild ? (
					<>
						<div className='flex-1/2'>{getIcon(type as TabTypes)}</div>
						<h1
							title={title}
							className={cn(
								'truncate font-sfCompact text-subtle',
								active ? 'text-default' : 'text-subtle group-hover:text-default',
							)}
						>
							{title}
						</h1>
					</>
				) : (
					children
				)}
			</Button>
			<div className='flex items-center mr-2'>{actions}</div>
		</div>
	);
}
