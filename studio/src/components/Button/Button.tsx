import { cn } from '@/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import './Button.scss';
import { CircleNotch } from '@phosphor-icons/react';
import { Link, LinkProps } from 'react-router-dom';
import { RefAttributes } from 'react';
import * as React from 'react';

const buttonVariants = cva('btn', {
	variants: {
		variant: {
			primary: 'btn-primary',
			secondary: 'btn-secondary',
			destructive: 'btn-destructive',
			text: 'btn-text',
			link: 'btn-link',
			blank: 'btn-blank',
			outline: 'btn-outline',
		},
		iconOnly: {
			true: 'btn-icon-only',
		},
		size: {
			md: 'btn-md',
			sm: 'btn-sm',
			lg: 'btn-lg',
			xl: 'btn-xl',
			full: 'btn-full',
		},
		loading: {
			true: 'btn-loading',
		},
		rounded: {
			true: 'btn-rounded',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
		loading: false,
		rounded: false,
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
	HTMLButtonElement & (LinkProps & RefAttributes<HTMLAnchorElement>),
	ButtonProps
>(
	(
		{
			className,
			variant,
			children,
			to,
			size,
			loading,
			rounded,
			iconOnly,
			asChild = false,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button';

		if (to) {
			return (
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				/* @ts-ignore */
				<Link
					to={to}
					className={cn(buttonVariants({ size, variant, loading, rounded, iconOnly, className }))}
					ref={ref}
					{...props}
				>
					{loading && <CircleNotch size={20} className='loading' />}
					{children}
				</Link>
			);
		}
		return (
			<Comp
				className={cn(buttonVariants({ size, variant, loading, rounded, iconOnly, className }))}
				ref={ref}
				{...props}
			>
				{loading && <CircleNotch size={20} className='loading' />}
				{children}
			</Comp>
		);
	},
);
Button.displayName = 'Button';

const ButtonGroup = ({ children }: { children: React.ReactNode }) => {
	return <div className='btn-group'>{children}</div>;
};

export { Button, buttonVariants, ButtonGroup };
