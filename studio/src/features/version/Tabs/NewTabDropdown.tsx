import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuItemContainer,
} from 'components/Dropdown';
import { Button } from 'components/Button';
import { Plus } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { SearchInput } from 'components/SearchInput';
import { Tab } from '@/types';
import { NEW_TAB_ITEMS } from 'constants/constants.ts';
import useTabStore from '@/store/version/tabStore.ts';

export default function NewTabDropdown() {
	const { addTab } = useTabStore();
	function newTab(item: Omit<Tab, 'id'>) {
		addTab(item);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button rounded variant='blank' iconOnly>
					<Plus size={15} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='tab-dropdown-content'>
				<DropdownMenuLabel>
					<SearchInput placeholder='Search' className='tab-search-input' />
				</DropdownMenuLabel>
				<DropdownMenuItemContainer>
					{NEW_TAB_ITEMS.map((item) => (
						<DropdownMenuItem onClick={() => newTab(item)} asChild key={item.path}>
							<Link replace to={item.path}>
								{item.title}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
