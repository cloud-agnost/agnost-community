import * as React from 'react';
import { cn } from '@/utils';
import { Label } from '../Label';
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
				className={cn('input', props.error && 'error', className)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };

const InputWrapper = React.forwardRef<HTMLDivElement, InputWrapperProps>(
	({ className, children, ...props }, ref) => (
		<div ref={ref} className={cn('input-wrapper', className)} {...props}>
			{props.label && <Label htmlFor={props.id}>{props.label}</Label>}
			{children}
			{props.description && (
				<p className={cn('input-description', props.error && 'error')}>{props.description}</p>
			)}
		</div>
	),
);
InputWrapper.displayName = 'InputWrapper';

export { InputWrapper };
