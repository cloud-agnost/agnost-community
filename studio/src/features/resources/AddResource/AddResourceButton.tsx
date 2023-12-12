import { Button } from '@/components/Button';
import { DEFAULT_RESOURCE_INSTANCES, RESOURCE_ICON_MAP } from '@/constants';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useResourceStore from '@/store/resources/resourceStore';
import useTypeStore from '@/store/types/typeStore';
import { capitalize } from '@/utils';
import { CaretDown, Plus } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceCreateType, ResourceType } from '@/types';
export default function AddResourceButton() {
	const canCreateResource = useAuthorizeOrg('resource.create');
	const { selectResourceType, toggleCreateResourceModal } = useResourceStore();
	const { instanceTypes, resourceTypes } = useTypeStore();
	const { t } = useTranslation();

	function getIcon(type: string) {
		const Icon = RESOURCE_ICON_MAP[type];
		return <Icon className='w-5 h-5' />;
	}

	const selectResource = (resourceType: ResourceType, type: string, instance: string) => {
		selectResourceType(instance, type, resourceType);
		toggleCreateResourceModal();
	};

	const filteredResources = useMemo(() => {
		return resourceTypes.filter((r) => r !== 'engine' && r !== 'realtime' && r !== 'scheduler');
	}, [resourceTypes]);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={!canCreateResource}>
				<Button className='gap-2 whitespace-nowrap' disabled={!canCreateResource}>
					<Plus weight='bold' />
					{t('resources.add')}
					<CaretDown weight='bold' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='max-h-[650px] overflow-y-auto'>
				<DropdownMenuItemContainer>
					{DEFAULT_RESOURCE_INSTANCES.map((type) => (
						<DropdownMenuSub key={type.id}>
							<DropdownMenuSubTrigger className='dropdown-item flex items-center gap-2'>
								<type.icon className='text-icon-base text-lg' />
								<span className='text-default'>{type.name}</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent
									className='w-48 dropdown-content data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade space-y-1'
									sideOffset={2}
									alignOffset={-5}
								>
									{filteredResources
										.filter((r) => type.id !== ResourceCreateType.New || r !== 'storage')
										.map((resourceType) => (
											<Fragment key={resourceType}>
												<DropdownMenuLabel className='py-[6px] col-span-2 text-subtle leading-6 text-sm font-medium'>
													{capitalize(resourceType)}
												</DropdownMenuLabel>
												{instanceTypes[resourceType].map((instance) => (
													<DropdownMenuItem
														asChild
														key={instance}
														onClick={() => selectResource(resourceType, type.id, instance)}
													>
														<div className='space-x-2'>
															{getIcon(instance)}
															<span>{instance}</span>
														</div>
													</DropdownMenuItem>
												))}
												<DropdownMenuSeparator />
											</Fragment>
										))}
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
