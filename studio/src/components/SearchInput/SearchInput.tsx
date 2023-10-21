import { Input } from '@/components/Input';
import { useDebounce, useUpdateEffect } from '@/hooks';
import { cn } from '@/utils';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './searchInput.scss';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { use } from 'i18next';
interface SearchInputProps extends React.ComponentPropsWithoutRef<'input'> {
	onSearch?: (value: string) => void;
	onClear?: () => void;
}

export default function SearchInput({
	className,
	placeholder,
	onClear,
	onSearch,
	value,
	...props
}: SearchInputProps) {
	const [inputValue, setInputValue] = useState<string>((value as string) ?? '');
	const [searchParams, setSearchParams] = useSearchParams();
	const searchTerm = useDebounce(inputValue, 500);
	const { t } = useTranslation();
	const ref = React.useRef<HTMLInputElement>(null);
	function clear() {
		setInputValue('');
		onClear?.();
	}

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		onSearch?.(value);
		setSearchParams({ ...searchParams, q: value });
	}

	useUpdateEffect(() => {
		onInput?.(searchTerm);
	}, [searchTerm]);

	useUpdateEffect(() => {
		if (ref.current && !inputValue) {
			ref.current.focus();
			ref.current.value = '';
		}
	}, [inputValue]);

	useUpdateEffect(() => {
		setInputValue(searchParams.get('q') ?? '');
	}, [searchParams.get('q')]);

	return (
		<div className={cn('search-input-wrapper', className)} {...props}>
			<MagnifyingGlass size={20} className='search-input-icon' />
			<Input
				ref={ref}
				defaultValue={inputValue}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				placeholder={placeholder ?? t('general.search').toString()}
				className='search-input'
			/>
			{inputValue && (
				<Button
					className='search-input-button'
					onClick={clear}
					variant='blank'
					type='button'
					iconOnly
				>
					<X size={20} />
				</Button>
			)}
		</div>
	);
}
