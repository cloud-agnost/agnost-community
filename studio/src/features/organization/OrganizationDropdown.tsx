import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandSeparator,
} from '@/components/Command';
import { InfoModal } from '@/components/InfoModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { OrganizationCreateModal } from '@/features/organization';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, Check, Plus } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import './organization.scss';
import useAuthStore from '@/store/auth/authStore';
import _ from 'lodash';

export function OrganizationDropdown() {
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const {
		organizations,
		organization,
		selectOrganization,
		leaveOrganization,
		getAllOrganizationByUser,
	} = useOrganizationStore();
	const navigate = useNavigate();
	const { notify } = useToast();
	function handleLeave() {
		leaveOrganization({
			organizationId: organization?._id,
			onSuccess: () => {
				notify({
					title: t('organization.leave.success.title', {
						name: organization?.name,
					}),
					description: t('organization.leave.success.description', {
						name: organization?.name,
					}),
					type: 'success',
				});
				navigate('/organization');
			},
			onError: ({ error, details }) => {
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
		setOpenModal(false);
	}

	useEffect(() => {
		if (_.isEmpty(organizations)) {
			getAllOrganizationByUser();
		}
	}, []);
	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<div className='organization-dropdown'>
					<Link to={`/organization/${organization?._id}`}>
						<OrganizationLabel organization={organization} />
					</Link>
					<PopoverTrigger asChild>
						<Button
							variant='blank'
							aria-expanded={open}
							className='organization-dropdown-button'
							rounded
						>
							<div className='organization-dropdown-icon'>
								<CaretUpDown size={20} />
							</div>
						</Button>
					</PopoverTrigger>
				</div>
				<PopoverContent align='start' className='organization-dropdown-content'>
					<Command>
						{organizations.length > 5 && (
							<CommandInput placeholder={t('organization.select') as string} />
						)}
						<CommandEmpty>{t('organization.empty')}</CommandEmpty>
						<CommandGroup className='organization-dropdown-container'>
							<div className='organization-dropdown-options'>
								{organizations.map((org) => (
									<CommandItem
										key={org._id}
										value={org._id}
										onSelect={() => {
											selectOrganization(org);
											navigate(`/organization/${org?._id}`);
											setOpen(false);
										}}
										className='organization-dropdown-option'
									>
										<OrganizationLabel organization={org} />
										<Check
											size={16}
											className={cn(
												'text-icon-base',
												organization?._id === org?._id ? 'opacity-100 ' : 'opacity-0',
											)}
											weight='bold'
										/>
									</CommandItem>
								))}
							</div>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup className='organization-dropdown-footer'>
							<CommandItem className='organization-dropdown-leave'>
								<Button
									disabled={organization?.ownerUserId === user?._id}
									variant='blank'
									className='text-subtle'
									onClick={() => {
										setOpenModal(true);
										setOpen(false);
									}}
								>
									{t('organization.leave.main')}
								</Button>
							</CommandItem>
							<CommandItem>
								<Button
									disabled={!user?.isClusterOwner}
									size='full'
									variant='secondary'
									onClick={() => {
										setOpenCreateModal(true);
										setOpen(false);
									}}
								>
									<Plus size={16} className='mr-2' />
									{t('organization.create')}
								</Button>
							</CommandItem>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
			<InfoModal
				isOpen={openModal}
				closeModal={() => setOpenModal(false)}
				onConfirm={handleLeave}
				title={t('organization.leave.main')}
				description={t('organization.leave.description', {
					name: organization?.name,
				})}
			/>
			<OrganizationCreateModal
				key={openCreateModal.toString()}
				isOpen={openCreateModal}
				closeModal={() => setOpenCreateModal(false)}
			/>
		</>
	);
}

const OrganizationLabel = ({ organization }: { organization: Organization | null }) => (
	<div className='organization-label'>
		<Avatar className='mr-2' size='sm' square>
			<AvatarImage src={organization?.pictureUrl} alt={organization?.name} />
			<AvatarFallback name={organization?.name} color={organization?.color as string} />
		</Avatar>
		<div className='organization-dropdown-label'>
			<div className='organization-dropdown-name'>{organization?.name}</div>
			<div className='organization-dropdown-desc'>{organization?.role}</div>
		</div>
	</div>
);
