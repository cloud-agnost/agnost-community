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
	({ className, type, value, error, ...props }, ref) => {
		const [inputValue, setInputValue] = React.useState(value);

		return (
			<input
				type={type}
				className={cn('input', error && 'input-error', className)}
				ref={ref}
				value={inputValue}
				onChange={(e) => {
					setInputValue(type === 'number' ? e.target.valueAsNumber : e.target.value);
				}}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
