import useTabStore from '@/store/version/tabStore.ts';
import useVersionStore from '@/store/version/versionStore';
import { DesignElement, Tab, TabTypes } from '@/types';
import { capitalize, generateId } from '@/utils';
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
import { NEW_TAB_ITEMS, TAB_ICON_MAP } from 'constants/constants.ts';
import { useParams } from 'react-router-dom';
export default function NewTabDropdown() {
	const { addTab } = useTabStore();
	const { searchDesignElements, designElements, resetDesignElements, getVersionDashboardPath } =
		useVersionStore();
	const { versionId, appId, orgId } = useParams() as {
		versionId: string;
		appId: string;
		orgId: string;
	};

	function handleAddTab(item: (typeof NEW_TAB_ITEMS)[number]) {
		const tab = {
			id: generateId(),
			...item,
		};
		addTab(versionId, tab);
	}

	function handleClickElement(item: DesignElement) {
		const path = getVersionDashboardPath(`${item.type}/${item._id}`);
		const tab: Tab = {
			id: generateId(),
			title: item.name,
			path,
			isActive: true,
			isDashboard: false,
			isDirty: false,
			type: capitalize(item.type) as TabTypes,
		};
		addTab(versionId, tab);
	}

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			resetDesignElements();
			return;
		}
		searchDesignElements({
			orgId,
			appId,
			versionId,
			keyword: value as string,
		});
	}

	function getIcon(type: TabTypes): JSX.Element {
		const IconComponent = TAB_ICON_MAP[type];
		return <IconComponent className='w-8 h-8 text-icon-base' />;
	}
	return (
		<DropdownMenu onOpenChange={resetDesignElements}>
			<DropdownMenuTrigger asChild>
				<Button rounded variant='blank' iconOnly>
					<Plus size={15} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='tab-dropdown-content'>
				<DropdownMenuLabel>
					<SearchInput placeholder='Search' className='tab-search-input' onSearch={onInput} />
				</DropdownMenuLabel>
				<DropdownMenuItemContainer>
					{designElements.length > 0
						? designElements.map((item) => (
								<DropdownMenuItem asChild key={item._id} onClick={() => handleClickElement(item)}>
									<div className='space-x-3'>
										<div className=' bg-lighter p-2 rounded-lg'>
											{getIcon(capitalize(item.type) as TabTypes)}
										</div>
										<div className='space-y-2'>
											<p className='text-subtle font-sfCompact'>{capitalize(item.type)}</p>
											<p className='text-default font-sfCompact'>{item.name}</p>
										</div>
									</div>
								</DropdownMenuItem>
						  ))
						: NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
								<DropdownMenuItem onClick={() => handleAddTab(item)} asChild key={item.path}>
									<span>{item.title}</span>
								</DropdownMenuItem>
						  ))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
