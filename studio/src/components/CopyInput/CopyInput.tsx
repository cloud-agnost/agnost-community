import { Input } from '@/components/Input';
import { cn, copyToClipboard } from '@/utils';
import { Copy } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './copyInput.scss';
import { useUpdateEffect } from '@/hooks';

const CopyInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
	({ className, value, readOnly, placeholder, ...props }, ref) => {
		const [inputValue, setInputValue] = useState<string>(value as string);

		useUpdateEffect(() => {
			setInputValue(value as string);
		}, [value]);

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
					onClick={() => copyToClipboard(inputValue)}
					variant='icon'
					size='sm'
					rounded
				>
					<Copy size={14} />
				</Button>
			</div>
		);
	},
);
CopyInput.displayName = 'CopyInput';

export { CopyInput };
