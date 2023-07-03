'use client';

import { cn } from '@/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';
import './scrollArea.scss';

const ScrollArea = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, id, ...props }, ref) => (
	<ScrollAreaPrimitive.Root ref={ref} className={cn('scroll-area', className)} {...props}>
		<ScrollAreaPrimitive.Viewport className='scroll-area-viewport' id={id}>
			{children}
		</ScrollAreaPrimitive.Viewport>
		<ScrollBar />
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		orientation={orientation}
		className={cn(
			'scroll-bar',
			orientation === 'vertical' && 'scroll-bar--vertical',
			orientation === 'horizontal' && 'scroll-bar--horizontal',
			className,
		)}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb className='scroll-thumb' />
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
