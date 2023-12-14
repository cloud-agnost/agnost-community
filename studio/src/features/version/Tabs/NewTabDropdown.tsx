import { Button } from '@/components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { SearchInput } from '@/components/SearchInput';
import { NEW_TAB_ITEMS, TAB_ICON_MAP } from '@/constants';
import useTabStore from '@/store/version/tabStore.ts';
import useVersionStore from '@/store/version/versionStore';
import { DesignElement, Tab, TabTypes } from '@/types';
import { capitalize, generateId } from '@/utils';
import { Plus } from '@phosphor-icons/react';
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
			path: getVersionDashboardPath(item.path),
		};

		addTab(versionId, tab);
	}

	function handleClickElement(item: DesignElement) {
		let url = `${item.type}/${item._id}`;
		if (capitalize(item.type) === TabTypes.Model) url = `/database/${item.meta.dbId}/models`;
		if (capitalize(item.type) === TabTypes.Field)
			url = `database/${item.meta.dbId}/models/${item.modelId}/fields`;

		const path = getVersionDashboardPath(url);

		const tab: Tab = {
			id: generateId(),
			title: capitalize(item.type) === TabTypes.Field ? item.meta.modelName : item.name,
			path,
			isActive: true,
			isDashboard: false,
			isDirty: false,
			type: capitalize(item.type) as TabTypes,
		};
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
			<PopoverContent className='tab-dropdown-content'>
				<div className='p-2'>
					<SearchInput
						className='tab-search-input'
						onSearch={onInput}
						onClear={resetDesignElements}
						urlKey='s'
					/>
				</div>

				<div className='overflow-auto max-h-96'>
					<div className='space-y-4'>
						{designElements.map((item) => (
							<Button
								key={item._id}
								onClick={() => handleClickElement(item)}
								variant='text'
								className='flex items-center justify-start gap-4 relative p-2 w-full text-left font-normal'
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
							</Button>
						))}
					</div>
					{!designElements.length &&
						NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
							<Button
								onClick={() => handleAddTab(item)}
								key={item.path}
								className='flex items-center justify-start gap-4 relative p-2 w-full text-left font-normal'
								variant='text'
							>
								{getIcon(capitalize(item.type) as TabTypes)}
								<h1 title={item.title} className='flex-1 truncate max-w-[15ch]'>
									{item.title}
								</h1>
							</Button>
						))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
