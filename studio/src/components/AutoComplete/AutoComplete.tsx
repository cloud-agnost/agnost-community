import AsyncSelect from 'react-select/async';
import './autocomplete.scss';

interface Props<T> {
	onChange: (value: T) => void;
	loadOptions: (inputValue: string) => void;
	formatOptionLabel?: (props: any) => JSX.Element;
	formatGroupLabel?: (props: any) => JSX.Element;
	isMulti?: boolean;
	placeholder?: string;
}

export default function AutoComplete<T>({
	onChange,
	loadOptions,
	isMulti,
	placeholder,

	...props
}: Props<T>) {
	return (
		<AsyncSelect
			cacheOptions
			defaultOptions
			loadOptions={loadOptions}
			onChange={({ value }: { value: T }) => onChange(value)}
			className='select-container'
			classNamePrefix='select'
			placeholder={placeholder || 'Search...'}
			isMulti={isMulti}
			{...props}
		/>
	);
}
