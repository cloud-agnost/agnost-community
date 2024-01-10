import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import '@/components/Dropdown/dropdown.scss';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { SearchInput } from '@/components/SearchInput';
import { HTTP_METHOD_BADGE_MAP, NEW_TAB_ITEMS, TAB_ICON_MAP } from '@/constants';
import { useSearchTabClick } from '@/hooks';
import useTabStore from '@/store/version/tabStore.ts';
import useVersionStore from '@/store/version/versionStore';
import { TabTypes } from '@/types';
import { capitalize, generateId } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { useParams } from 'react-router-dom';
export default function NewTabDropdown() {
	const { addTab } = useTabStore();
	const { searchDesignElements, designElements, resetDesignElements, getVersionDashboardPath } =
		useVersionStore();
	const handleClickElement = useSearchTabClick();
	const { versionId, appId, orgId } = useParams() as {
		versionId: string;
		appId: string;
		orgId: string;
	};

	function handleAddTab(item: (typeof NEW_TAB_ITEMS)[number]) {
		const tab = {
			id: generateId(),
			...item,
			path: getVersionDashboardPath(item.path),
		};
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		addTab(versionId, tab);
	}

	function onInput(keyword: string) {
		if (!keyword) {
			resetDesignElements();
			return;
		}
		searchDesignElements({
			orgId,
			appId,
			versionId,
			keyword,
		});
	}

	function getIcon(type: TabTypes): JSX.Element {
		const IconComponent = TAB_ICON_MAP[type];
		return <IconComponent className='w-5 h-5' />;
	}
	return (
		<Popover onOpenChange={resetDesignElements}>
			<PopoverTrigger asChild>
				<Button rounded variant='blank' iconOnly>
					<Plus size={15} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='tab-dropdown-content bg-wrapper-background-base'>
				<div className='p-2'>
					<SearchInput
						className='tab-search-input'
						onSearch={onInput}
						onClear={resetDesignElements}
						urlKey='s'
					/>
				</div>

				<div className='overflow-auto max-h-96 dropdown-item-container space-y-2'>
					{designElements.map((item) => (
						<Button
							key={item._id}
							onClick={() => handleClickElement(item)}
							variant='text'
							className='dropdown-item flex items-center justify-start gap-4 relative py-6 px-2 w-full text-left font-normal'
						>
							<div className=' bg-lighter p-2 rounded-lg'>
								{getIcon(capitalize(item.type) as TabTypes)}
							</div>
							<div>
								<p className='text-subtle font-sfCompact'>
									{capitalize(item.type)}
									{capitalize(item.type) === TabTypes.Field && ` - ${item.meta.modelName}`}
								</p>
								<p className='text-default font-sfCompact'>{item.name}</p>
							</div>
							{item.meta?.method && (
								<Badge
									variant={HTTP_METHOD_BADGE_MAP[item.meta.method]}
									text={item.meta.method}
									className='absolute right-2'
								/>
							)}
						</Button>
					))}
				</div>
				{!designElements.length &&
					NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
						<Button
							onClick={() => handleAddTab(item)}
							key={item.path}
							className='dropdown-item flex items-center justify-start gap-4 relative p-3 w-full text-left font-normal'
							variant='text'
						>
							{getIcon(capitalize(item.type) as TabTypes)}
							<h1 title={item.title} className='flex-1 truncate max-w-[15ch]'>
								{item.title}
							</h1>
						</Button>
					))}
			</PopoverContent>
		</Popover>
	);
}
