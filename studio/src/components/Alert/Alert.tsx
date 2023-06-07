import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils';
import { Check, Warning, WarningCircle } from '@phosphor-icons/react';
import './alert.scss';

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
			{variant === 'success' && <Check size={24} />}
			{variant === 'warning' && <Warning size={24} />}
			{variant === 'error' && <WarningCircle size={24} />}
		</div>
		<div className='alert-body'>{props.children}</div>
	</div>
));
Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('alert-description', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };
