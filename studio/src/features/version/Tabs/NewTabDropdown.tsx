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
import { Link, useParams } from 'react-router-dom';
import { SearchInput } from 'components/SearchInput';
import { Tab } from '@/types';
import { NEW_TAB_ITEMS } from 'constants/constants.ts';
import useTabStore from '@/store/version/tabStore.ts';

export default function NewTabDropdown() {
	const { addTab, getTabsByVersionId } = useTabStore();
	const { versionId } = useParams() as { versionId: string };

	const tabs = getTabsByVersionId(versionId);
	const newIndex = tabs.length;

	function newTab(item: Tab) {
		addTab(versionId, item);
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
					{NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
						<DropdownMenuItem onClick={() => newTab(item)} asChild key={item.path}>
							<Link to={`${item.path}?tabId=${newIndex}`}>{item.title}</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
