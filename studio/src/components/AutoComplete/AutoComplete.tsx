import AsyncSelect from 'react-select/async';
import './autocomplete.scss';

interface Props<T> {
	onChange: (value: T) => void;
	loadOptions: (inputValue: string) => void;
	formatOptionLabel?: (props: any) => JSX.Element;
	formatGroupLabel?: (props: any) => JSX.Element;
}

export default function AutoComplete<T>({ onChange, loadOptions, ...props }: Props<T>) {
	return (
		<AsyncSelect
			cacheOptions
			loadOptions={loadOptions}
			onChange={({ value }) => onChange(value)}
			defaultOptions
			className='select-container'
			classNamePrefix='select'
			placeholder='Enter username or email'
			{...props}
		/>
	);
}
