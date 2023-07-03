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
import useVersionStore, { Tab } from '@/store/version/versionStore.ts';

const NEW_TAB_ITEMS: Omit<Tab, 'id'>[] = [
	{
		title: 'Databases',
		path: 'database',
	},
	{
		title: 'Storage',
		path: 'storage',
	},
	{
		title: 'Cache',
		path: 'cache',
	},
	{
		title: 'Endpoints',
		path: 'endpoint',
	},
	{
		title: 'Message Queues',
		path: 'message-queue',
	},
	{
		title: 'Cron Jobs',
		path: 'cron-job',
	},
];

export default function NewTabDropdown() {
	const { addTab } = useVersionStore();
	function newTab(item: Omit<Tab, 'id'>) {
		addTab(item);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='blank' iconOnly>
					<Plus size={20} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='tab-dropdown-content'>
				<DropdownMenuLabel>
					<SearchInput placeholder='Search' className='tab-search-input' />
				</DropdownMenuLabel>
				<DropdownMenuItemContainer>
					{NEW_TAB_ITEMS.map((item) => (
						<DropdownMenuItem onClick={() => newTab(item)} asChild key={item.path}>
							<Link to={item.path}>{item.title}</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
