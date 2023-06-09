import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import './switch.scss';
import { cn } from '@/utils';
import { Lock } from '@phosphor-icons/react';

const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, value, ...props }, ref) => (
	<SwitchPrimitives.Root
		value={value}
		className={cn('switch-root', className)}
		{...props}
		ref={ref}
	>
		<SwitchPrimitives.Thumb className={cn('switch-thumb')} />
		<Lock className='switch-lock' />
	</SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
