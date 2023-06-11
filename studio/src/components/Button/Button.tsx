import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import './Button.scss';
import { CircleNotch } from '@phosphor-icons/react';
import { Link, LinkProps } from 'react-router-dom';
import { RefAttributes } from 'react';
import * as React from 'react';
import IntrinsicAttributes = React.JSX.IntrinsicAttributes;

const buttonVariants = cva('btn', {
	variants: {
		variant: {
			primary: 'btn-primary',
			secondary: 'btn-secondary',
			destructive: 'btn-destructive',
			text: 'btn-text',
			link: 'btn-link',
		},
		icon: {
			true: 'btn-icon',
		},
		size: {
			md: 'btn-md',
			sm: 'btn-sm',
			lg: 'btn-lg',
			full: 'btn-full',
		},
		loading: {
			true: 'btn-loading',
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
	to?: string;
}

const Button = React.forwardRef<
	HTMLButtonElement & (IntrinsicAttributes & LinkProps & RefAttributes<HTMLAnchorElement>),
	ButtonProps
>(({ className, variant, children, to, size, loading, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';

	if (to) {
		return (
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			/* @ts-ignore */
			<Link
				to={to}
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{loading && <CircleNotch size={20} className='loading' />}
				{children}
			</Link>
		);
	}
	return (
		<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
			{loading && <CircleNotch size={20} className='loading' />}
			{children}
		</Comp>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
