import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils';

const buttonVariants = cva('btn', {
	variants: {
		variant: {
			default: 'bg-blue-500 text-white hover:bg-blue-400',
		},
		size: {
			default: 'h-10 py-2 px-4',
			sm: 'h-9 px-3 rounded-md',
			lg: 'h-11 px-8 rounded-md',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
});

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
