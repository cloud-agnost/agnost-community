import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils';

const TooltipProvider = TooltipPrimitive.Provider;

type TooltipProps = React.ComponentPropsWithoutRef<typeof TooltipProvider> &
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;

function Tooltip({
	children,
	delayDuration,
	skipDelayDuration,
	disableHoverableContent,
	...rest
}: TooltipProps) {
	return (
		<TooltipProvider
			delayDuration={delayDuration}
			skipDelayDuration={skipDelayDuration}
			disableHoverableContent={disableHoverableContent}
		>
			<TooltipPrimitive.Root {...rest}>{children}</TooltipPrimitive.Root>
		</TooltipProvider>
	);
}

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
	React.ElementRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Content
		ref={ref}
		sideOffset={sideOffset}
		className={cn(
			'z-50 overflow-hidden rounded-md bg-subtle px-3 py-1.5 text-xs text-subtle animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-10',
			className,
		)}
		{...props}
	/>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
