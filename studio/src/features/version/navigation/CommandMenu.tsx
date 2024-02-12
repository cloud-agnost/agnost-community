import { Button } from '@/components/Button';
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from '@/components/Command';
import { MethodBadge } from '@/components/Endpoint';
import { Loading } from '@/components/Loading';
import ApplicationCreateModal from '@/features/application/ApplicationCreateModal';
import { OrganizationCreateModal, OrganizationInvitationDrawer } from '@/features/organization';
import { SelectResourceTypeModal } from '@/features/resources';
import { useDebounce, useTabIcon, useUpdateEffect } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import useResourceStore from '@/store/resources/resourceStore';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { Application, DesignElement, ResourceCreateType, Tab, TabTypes } from '@/types';
import { generateId } from '@/utils';
import { EjectSimple, FileArchive, MagnifyingGlass, Plus, Users } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CommandMenu() {
	const [search, setSearch] = useState('');
	const searchTerm = useDebounce(search, 500);
	const [openCreateAppModal, setOpenCreateAppModal] = useState(false);
	const [openCreateOrgModal, setOpenCreateOrgModal] = useState(false);
	const [openEntitySearch, setOpenEntitySearch] = useState(false);
	const [openInviteOrgModal, setOpenInviteOrgModal] = useState(false);
	const { toggleSidebar, isSidebarOpen } = useUtilsStore();
	const {
		searchDesignElements,
		isSearchCommandMenuOpen,
		toggleSearchCommandMenu,
		getVersionDashboardPath,
		toggleSearchView,
		isSearchViewOpen,
	} = useVersionStore();
	const { addTab } = useTabStore();
	const { appId, orgId, versionId } = useParams() as Record<string, string>;
	const { openInviteMemberDrawer, application } = useApplicationStore();
	const { openSelectResourceTypeModal } = useResourceStore();
	const items = [
		{
			icon: <MagnifyingGlass />,
			label: 'Search through your source code',
			onClick: openCodeSearch,
			closeMenu: true,
		},
		{
			icon: <FileArchive />,
			label: 'Search app entities',
			onClick: () => setOpenEntitySearch(true),
			closeMenu: false,
		},

		{
			icon: <Users />,
			label: 'Invite users to org',
			onClick: () => setOpenInviteOrgModal(true),
			closeMenu: true,
		},
		{
			icon: <Plus />,
			label: 'Create Organization',
			onClick: () => setOpenCreateOrgModal(true),
			closeMenu: true,
		},
		{
			icon: <Users />,
			label: 'Invite users to app',
			onClick: () => openInviteMemberDrawer(application as Application),
			closeMenu: true,
		},
		{
			icon: <Plus />,
			label: 'Create Application',
			onClick: () => setOpenCreateAppModal(true),
			closeMenu: true,
		},
		{
			icon: <EjectSimple />,
			label: 'Connect Resource',
			onClick: () => openSelectResourceTypeModal(ResourceCreateType.Existing),
			closeMenu: true,
		},
		{
			icon: <Plus />,
			label: 'Create Resource',
			onClick: () => openSelectResourceTypeModal(ResourceCreateType.New),
			closeMenu: true,
		},
	];

	const getIcon = useTabIcon('w-5 h-5');
	useUpdateEffect(() => {
		if (!isSearchCommandMenuOpen) {
			setSearch('');
		}
	}, [isSearchCommandMenuOpen]);

	const { data, isFetching } = useQuery({
		queryKey: ['version', versionId, orgId, appId, searchTerm],
		queryFn: () =>
			searchDesignElements({
				orgId,
				appId,
				versionId,
				keyword: searchTerm,
			}),
		enabled: !!searchTerm,
	});

	function handleClickElement(item: DesignElement) {
		let url = `${item.type}/${item._id}`;
		if (_.capitalize(item.type) === TabTypes.Database) url = `database/${item._id}/models`;

		if (_.capitalize(item.type) === TabTypes.Model)
			url = `database/${item.meta.dbId}/models/${item._id}/fields`;

		const path = getVersionDashboardPath(url);

		const tab: Tab = {
			id: generateId(),
			title:
				_.capitalize(item.type) === TabTypes.Field ? (item.meta.modelName as string) : item.name,
			path,
			isActive: true,
			isDashboard: false,
			isDirty: false,
			type: _.capitalize(item.type) as TabTypes,
		};
		addTab(versionId, tab);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}

	function onClose() {
		setOpenEntitySearch(false);
		toggleSearchCommandMenu();
	}

	function openCodeSearch() {
		if (!isSidebarOpen) toggleSidebar();
		if (!isSearchViewOpen) toggleSearchView();
	}

	return (
		<>
			<CommandDialog open={isSearchCommandMenuOpen} onOpenChange={onClose}>
				{openEntitySearch && (
					<>
						<CommandInput
							value={search}
							onValueChange={setSearch}
							placeholder='Search app entities'
						/>

						<CommandList className='relative'>
							{isFetching ? (
								<CommandLoading>
									<Loading loading={isFetching} />
								</CommandLoading>
							) : (
								data?.map((item) => (
									<Button
										key={item._id}
										variant='blank'
										className='justify-between py-6 px-4 hover:bg-lighter dark:hover:bg-wrapper-background-hover rounded-none'
										size='full'
										onClick={() => handleClickElement(item)}
									>
										<div className='flex items-center gap-4'>
											{getIcon(_.capitalize(item.type) as TabTypes)}
											<p className='text-sm leading-6 tracking-wide font-sfCompact'>{item.name}</p>
										</div>
										<div className='flex items-center gap-4'>
											{item.meta?.method && <MethodBadge method={item.meta?.method} />}
											<p className='text-xs leading-6 text-subtle tracking-wide '>
												{_.capitalize(item.type) === TabTypes.Field && ` ${item.meta.modelName}`}
											</p>
											<p className='text-xs text-subtle leading-6 tracking-wide font-sfCompact'>
												{_.capitalize(item.type)}
											</p>
										</div>
									</Button>
								))
							)}
							{_.isEmpty(data) && searchTerm && <CommandEmpty>No results found.</CommandEmpty>}
						</CommandList>
					</>
				)}
				{!openEntitySearch && (
					<>
						<CommandInput placeholder='Type a command or search...' />
						<CommandList>
							<CommandEmpty>No results found.</CommandEmpty>
							{items.map(({ icon, label, onClick, closeMenu }) => {
								return (
									<CommandItem
										key={label}
										value={label}
										onSelect={() => {
											onClick();
											if (closeMenu) onClose();
										}}
									>
										<div className='flex items-center gap-2'>
											{icon}
											{label}
										</div>
									</CommandItem>
								);
							})}
						</CommandList>
					</>
				)}
			</CommandDialog>
			<OrganizationCreateModal
				isOpen={openCreateOrgModal}
				closeModal={() => setOpenCreateOrgModal(false)}
			/>
			<ApplicationCreateModal
				isOpen={openCreateAppModal}
				closeModal={() => setOpenCreateAppModal(false)}
			/>
			<OrganizationInvitationDrawer
				open={openInviteOrgModal}
				onOpenChange={setOpenInviteOrgModal}
			/>
			<SelectResourceTypeModal />
		</>
	);
}
