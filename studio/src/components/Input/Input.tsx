import { cn } from '@/utils';
import * as React from 'react';
import './input.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	type?: React.HTMLInputTypeAttribute;
	className?: string;
	error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, error, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn('input', error && 'input-error', className)}
				ref={ref}
				autoComplete='off'
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
