import { Input } from '@/components/Input';
import { cn } from '@/utils';
import { Copy } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './copyInput.scss';

const CopyInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
	({ className, value, readOnly, placeholder, ...props }, ref) => {
		const [inputValue, setInputValue] = useState<string>(value as string);

		return (
			<div className={cn('copy-input-wrapper', className)} {...props}>
				<Input
					ref={ref}
					value={inputValue}
					readOnly={readOnly}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={placeholder}
					className='copy-input'
				/>
				<Button
					className='copy-input-button'
					onClick={() => navigator.clipboard.writeText(inputValue)}
					variant='icon'
					type='button'
				>
					<Copy size={20} />
				</Button>
			</div>
		);
	},
);
CopyInput.displayName = 'CopyInput';

export { CopyInput };
