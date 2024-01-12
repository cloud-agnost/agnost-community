import { Button } from '@/components/Button';
import React from 'react';

import { cn } from '@/utils';

interface SideBarButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	active: boolean;
	className?: string;
	children: React.ReactNode;
}

export default function SideBarButton({
	active,
	className,
	children,
	...props
}: SideBarButtonProps) {
	return (
		<Button
			variant='blank'
			size='full'
			className={cn(
				active ? 'bg-button-primary/50' : 'hover:bg-wrapper-background-hover',
				'justify-start text-left gap-2 text-sm px-3 font-normal cursor-pointer !h-7',
				className,
			)}
			{...props}
		>
			{children}
		</Button>
	);
}
