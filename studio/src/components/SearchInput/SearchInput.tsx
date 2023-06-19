import { Input } from '@/components/Input';
import { cn } from '@/utils';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './searchInput.scss';

const SearchInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
	({ className, value, placeholder, ...props }, ref) => {
		const [inputValue, setInputValue] = useState(value);

		return (
			<div className={cn('search-input-wrapper', className)} {...props}>
				<MagnifyingGlass size={20} className='search-input-icon' />
				<Input
					ref={ref}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={placeholder}
					className='search-input'
				/>
				{inputValue && (
					<Button
						className='search-input-button'
						onClick={() => setInputValue('')}
						variant='blank'
						type='button'
					>
						<X size={20} />
					</Button>
				)}
			</div>
		);
	},
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
