import { cn } from '@/utils';
import * as React from 'react';
import './input.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	type?: React.HTMLInputTypeAttribute;
	className?: string;
	error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, error, onChange, ...props }, ref) => {
		const [value, setValue] = React.useState(props.value || '');

		const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			setValue(event.target.value);
			if (onChange) {
				onChange(event);
			}
		};

		return (
			<input
				type={type}
				className={cn('input', error && 'input-error', className)}
				ref={ref}
				autoComplete='off'
				value={value}
				onChange={handleChange}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
