import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
import './alert.scss';

const alertVariants = cva('alert', {
	variants: {
		variant: {
			success: 'alert-success',
			error: 'alert-error',
			warning: 'alert-warning',
		},
		size: {
			sm: 'alert-sm',
			md: 'alert-md',
			lg: 'alert-lg',
		},
		square: {
			true: 'avatar-square',
		},
	},
	defaultVariants: {
		variant: 'success',
		size: 'md',
	},
});

const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, size, ...props }, ref) => (
	<div
		ref={ref}
		role='alert'
		className={cn(alertVariants({ variant, size }), className)}
		{...props}
	>
		<div className='alert-icon'>
			{variant === 'success' && <CheckCircle className='text-elements-green' />}
			{variant === 'warning' && <Warning className='text-elements-yellow' />}
			{variant === 'error' && <XCircle className='text-elements-red' />}
		</div>
		<div className='alert-body'>{props.children}</div>
	</div>
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h4 ref={ref} className={cn('alert-title', className)} {...props}>
			{props.children}
		</h4>
	),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('alert-description', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
