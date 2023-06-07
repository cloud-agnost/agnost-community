import { Input, InputWrapper } from '@/components/Input';
import { cn } from '@/utils';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './password-input.scss';

export interface PasswordInputProps extends React.ComponentPropsWithoutRef<'input'> {
	className?: string;
	error?: boolean;
	id: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, id, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);
		return (
			<InputWrapper id={id} className={cn('password-input-wrapper', className)}>
				<Input ref={ref} type={showPassword ? 'text' : 'password'} className='password-input' />
				<Button
					className='password-input-button'
					onClick={() => setShowPassword(!showPassword)}
					variant='text'
				>
					{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
				</Button>
			</InputWrapper>
		);
	},
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
