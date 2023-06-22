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
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, Check, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { OrganizationCreateModal } from '@/features/Organization';
import './organization.scss';

export function OrganizationDropdown() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const { organizations, organization, selectOrganization, leaveOrganization } =
		useOrganizationStore();
	const navigate = useNavigate();
	const { notify } = useToast();

	function handleLeave() {
		leaveOrganization({
			organizationId: organization?._id as string,
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
	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div className='organization-dropdown'>
						<Link to={`/organization/${organization?._id}`}>
							<OrganizationLabel organization={organization} />
						</Link>
						<Button variant='blank' role='combobox' aria-expanded={open} rounded>
							<div className='organization-dropdown-icon'>
								<CaretUpDown size={20} className='text-icon-subtle' />
							</div>
						</Button>
					</div>
				</PopoverTrigger>
				<PopoverContent className='organization-dropdown-content'>
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
									variant='text'
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
				icon={
					<Avatar size='2xl'>
						<AvatarFallback color='#9B7B0866' />
					</Avatar>
				}
				action={
					<div className='flex  items-center justify-center gap-4'>
						<Button variant='text' size='lg' onClick={() => setOpenModal(false)}>
							{t('general.cancel')}
						</Button>
						<Button size='lg' variant='primary' onClick={handleLeave}>
							{t('general.ok')}
						</Button>
					</div>
				}
				title={t('organization.leave.main')}
				description={t('organization.leave.description', {
					name: organization?.name,
				})}
			/>
			<OrganizationCreateModal
				isOpen={openCreateModal}
				closeModal={() => setOpenCreateModal(false)}
			/>
		</>
	);
}

const OrganizationLabel = ({ organization }: { organization: Organization | null }) => (
	<div className='organization-label'>
		<Avatar className='mr-2' size='sm'>
			<AvatarImage src={organization?.pictureUrl} alt={organization?.name} />
			<AvatarFallback name={organization?.name} color={organization?.color as string} />
		</Avatar>
		<div className='organization-dropdown-label'>
			<div className='organization-dropdown-name'>{organization?.name}</div>
			<div className='organization-dropdown-desc'>{organization?.role}</div>
		</div>
	</div>
);
