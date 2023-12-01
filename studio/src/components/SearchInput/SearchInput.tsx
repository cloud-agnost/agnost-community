import { Input } from '@/components/Input';
import { useDebounce, useUpdateEffect } from '@/hooks';
import { cn } from '@/utils';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../Button';
import './searchInput.scss';
interface SearchInputProps extends React.ComponentPropsWithoutRef<'input'> {
	onSearch?: (value: string) => void;
	onClear?: () => void;
	urlKey?: string;
}

export default function SearchInput({
	className,
	placeholder,
	onClear,
	onSearch,
	value,
	urlKey = 'q',
	...props
}: SearchInputProps) {
	const [inputValue, setInputValue] = useState<string>((value as string) ?? '');
	const [searchParams, setSearchParams] = useSearchParams();
	const searchTerm = useDebounce(inputValue, 500);
	const { t } = useTranslation();
	const ref = React.useRef<HTMLInputElement>(null);
	function clear() {
		setInputValue(urlKey);
		searchParams.delete(urlKey);
		setSearchParams(searchParams);
		onClear?.();
	}

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete(urlKey);
			setSearchParams(searchParams);
		} else {
			searchParams.set(urlKey, value);
			setSearchParams(searchParams);
		}
		onSearch?.(value);
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
		setInputValue(searchParams.get(urlKey) ?? '');
	}, [searchParams.get(urlKey)]);
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
