import { cn } from '@/utils';
import * as React from 'react';
import './input.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url' | 'file';
	className?: string;
	error?: boolean;
}

export interface InputWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
	className?: string;
	label?: string;
	id: string;
	error?: string;
	description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn('input', props.error && 'input-error', className)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
