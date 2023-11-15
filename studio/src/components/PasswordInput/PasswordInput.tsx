import { Input } from '@/components/Input';
import { cn } from '@/utils';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './password-input.scss';

export interface PasswordInputProps extends React.ComponentPropsWithoutRef<'input'> {
	className?: string;
	error?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, value, placeholder, error, ...props }, ref) => {
		const [inputValue, setInputValue] = useState(value);
		const [showPassword, setShowPassword] = useState(false);

		React.useEffect(() => {
			setInputValue(value);
		}, [value]);

		return (
			<div className={cn('password-input-wrapper', className)} {...props}>
				<Input
					ref={ref}
					defaultValue={inputValue}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					error={error}
					type={showPassword ? 'text' : 'password'}
					placeholder={placeholder}
					className='password-input'
				/>
				<Button
					className='password-input-button p-2'
					onClick={() => setShowPassword(!showPassword)}
					iconOnly
					variant='blank'
					type='button'
				>
					{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
				</Button>
			</div>
		);
	},
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };