import { OrganizationMember } from '@/types';
import AsyncSelect from 'react-select/async';
import './autocomplete.scss';

interface Props {
	onChange: (value: OrganizationMember) => void;
	loadOptions: (inputValue: string) => void;
	formatOptionLabel?: (props: any) => JSX.Element;
	formatGroupLabel?: (props: any) => JSX.Element;
}

export default function AutoComplete({ onChange, loadOptions, ...props }: Props) {
	return (
		<AsyncSelect
			cacheOptions
			loadOptions={loadOptions}
			onChange={(value) => onChange(value as OrganizationMember)}
			defaultOptions
			className='select-container'
			classNamePrefix='select'
			placeholder='Enter username or email'
			{...props}
		/>
	);
}
