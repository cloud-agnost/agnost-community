import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import './Button.scss';
import { CircleNotch } from '@phosphor-icons/react';

const buttonVariants = cva('btn', {
	variants: {
		variant: {
			primary: 'btn-primary',
			secondary: 'btn-secondary',
			destructive: 'btn-destructive',
			text: 'btn-text',
			link: 'btn-link',
		},
		size: {
			md: 'btn-md',
			sm: 'btn-sm',
			full: 'btn-full',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
	},
});

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	label?: string;
	loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, loading, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
				{loading && <CircleNotch size={20} className='loading' />}
				{props.children}
			</Comp>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
