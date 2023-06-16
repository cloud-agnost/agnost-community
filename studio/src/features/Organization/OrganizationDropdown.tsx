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
import { Modal } from '@/components/Modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, Check, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
export function OrganizationDropdown() {
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const { organizations, organization, selectOrganization, leaveOrganization } =
		useOrganizationStore();
	const navigate = useNavigate();
	const { openCreateModal } = useOutletContext<{
		openCreateModal: () => void;
	}>();
	const { notify } = useToast();
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
				<PopoverContent className='w-[200px] p-0'>
					<Command>
						{organizations.length > 5 && <CommandInput placeholder='Select Organization' />}
						<CommandEmpty>No organizations found.</CommandEmpty>
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
									Leave Organization
								</Button>
							</CommandItem>
							<CommandItem>
								<Button
									variant='secondary'
									onClick={() => {
										openCreateModal();
										setOpen(false);
									}}
								>
									<Plus size={16} className='mr-2' />
									Create Organization
								</Button>
							</CommandItem>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
			<Modal isOpen={openModal} closeModal={() => setOpenModal(false)}>
				<div className='flex flex-col justify-center items-center gap-6'>
					<div className='w-24 h-24 rounded-full bg-yellow-500' />
					<div className='space-y-2'>
						<h2 className='text-default text-center text-xl'>Leave Organization</h2>
						<p className='text-subtle text-center text-sm font-albert'>
							You are about the leave the app team. After leaving the team you will not be able to
							access it again. Are you sure you would like to leave the{' '}
							<b className='text-default'>{organization?.name}</b> team?
						</p>
					</div>
					<div className='flex  items-center justify-center gap-4'>
						<Button variant='text' size='lg' onClick={() => setOpenModal(false)}>
							Cancel
						</Button>
						<Button
							size='lg'
							variant='primary'
							onClick={() => {
								leaveOrganization({
									organizationId: organization?._id as string,
									onSuccess: () => {
										notify({
											title: 'Organization lef successfully',
											description: 'You have left the organization.',
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
							}}
						>
							Ok
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

const OrganizationLabel = ({ organization }: { organization: Organization | null }) => (
	<div className='flex items-center'>
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
