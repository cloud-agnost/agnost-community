'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/utils';

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn('relative flex w-full touch-none select-none items-center', className)}
		{...props}
	>
		<SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-brand-primary-darker'>
			<SliderPrimitive.Range className='absolute h-full bg-brand-primary' />
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb className='cursor-pointer block h-6 w-6 rounded-full border-2 border-brand-primary bg-brand-primary-darker shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50' />
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
