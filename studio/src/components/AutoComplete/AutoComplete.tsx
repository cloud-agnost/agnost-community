import ReactSelectAsync, { AsyncProps } from 'react-select/async';
import { GroupBase } from 'react-select';

import './autocomplete.scss';

export default function AutoComplete<
	OptionType,
	IsMulti extends boolean = false,
	GroupType extends GroupBase<OptionType> = GroupBase<OptionType>,
>({ ...props }: AsyncProps<OptionType, IsMulti, GroupType>) {
	return <ReactSelectAsync className='select-container' classNamePrefix='select' {...props} />;
}
