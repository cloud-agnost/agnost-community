import useTabStore from '@/store/version/tabStore.ts';
import { generateId } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { SearchInput } from 'components/SearchInput';
import { NEW_TAB_ITEMS } from 'constants/constants.ts';
import { useNavigate, useParams } from 'react-router-dom';
export default function NewTabDropdown() {
	const { addTab, setCurrentTab } = useTabStore();
	const { versionId } = useParams() as { versionId: string };
	const navigate = useNavigate();

	function handleAddTab(item: (typeof NEW_TAB_ITEMS)[number]) {
		const tab = {
			id: generateId(),
			...item,
		};
		addTab(versionId, tab);
		navigate(`${tab.path}?tabId=${tab.id}`);
		setCurrentTab(versionId, tab.id);
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
						<DropdownMenuItem onClick={() => handleAddTab(item)} asChild key={item.path}>
							<span>{item.title}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
