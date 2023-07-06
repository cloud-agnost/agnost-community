import React from 'react';
import { cn } from '@/utils';
import { Check, X } from '@phosphor-icons/react';
import { cva, type VariantProps } from 'class-variance-authority';
import './toast.scss';

const toastVariants = cva('toast-icon', {
	variants: {
		type: {
			success: 'toast-success',
			error: 'toast-error',
		},
	},
	defaultVariants: {
		type: 'success',
	},
});
interface ToastProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof toastVariants> {
	type?: 'success' | 'error';
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(({ className, type, ...props }, ref) => (
	<div id={'sa'} ref={ref} className={cn('toast', className)}>
		<div className={cn(toastVariants({ type }))}>
			{type === 'success' && <Check size={20} weight='bold' />}
			{type === 'error' && <X size={20} />}
		</div>
		<div className='toast-content'>{props.children}</div>
	</div>
));
Toast.displayName = 'Toast';

const ToastTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h2 ref={ref} className={cn('toast-title', className)} {...props}>
			{props.children}
		</h2>
	),
);

ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p ref={ref} className={cn('toast-description', className)} {...props} />
));
ToastDescription.displayName = 'ToastDescription';

export { Toast, ToastTitle, ToastDescription };
