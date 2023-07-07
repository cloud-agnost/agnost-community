import { Input } from '@/components/Input';
import { useDebounce, useUpdateEffect } from '@/hooks';
import { cn } from '@/utils';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './searchInput.scss';
import { useTranslation } from 'react-i18next';
interface SearchInputProps extends React.ComponentPropsWithoutRef<'input'> {
	onSearch?: (value: string) => void;
}
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
	({ className, placeholder, onSearch, value, ...props }, ref) => {
		const [inputValue, setInputValue] = useState<string>((value as string) ?? '');
		const searchTerm = useDebounce(inputValue, 500);
		const { t } = useTranslation();
		useUpdateEffect(() => {
			onSearch?.(searchTerm);
		}, [searchTerm]);

		return (
			<div className={cn('search-input-wrapper', className)} {...props}>
				<MagnifyingGlass size={20} className='search-input-icon' />
				<Input
					ref={ref}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={placeholder ?? t('general.search').toString()}
					className='search-input'
				/>
				{inputValue && (
					<Button
						className='search-input-button'
						onClick={() => setInputValue('')}
						variant='blank'
						type='button'
						iconOnly
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
