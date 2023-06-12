import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';

import './alert.scss';
import { SuccessCheck, Warning, Error } from '@/components/icons';

const alertVariants = cva('alert', {
	variants: {
		variant: {
			success: 'alert-success',
			error: 'alert-error',
			warning: 'alert-warning',
		},
	},
	defaultVariants: {
		variant: 'success',
	},
});

const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
	<div ref={ref} role='alert' className={cn(alertVariants({ variant }), className)} {...props}>
		<div className='alert-icon'>
			{variant === 'success' && <SuccessCheck />}
			{variant === 'warning' && <Warning />}
			{variant === 'error' && <Error />}
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
	<p ref={ref} className={cn('alert-description', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
