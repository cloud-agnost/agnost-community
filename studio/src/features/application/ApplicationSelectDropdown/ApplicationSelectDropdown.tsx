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
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore.ts';
import { Application } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, Check, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './appSelectDropdown.scss';

export default function ApplicationSelectDropdown() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const { applications, application, selectApplication } = useApplicationStore();

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div className='application-dropdown'>
						<ApplicationLabel application={application} />
						<Button
							variant='blank'
							role='combobox'
							aria-expanded={open}
							className='application-dropdown-button'
							rounded
						>
							<div className='application-dropdown-icon'>
								<CaretUpDown size={20} />
							</div>
						</Button>
					</div>
				</PopoverTrigger>
				<PopoverContent align='start' className='application-dropdown-content'>
					<Command>
						{applications.length > 5 && (
							<CommandInput placeholder={t('organization.select') as string} />
						)}
						<CommandEmpty>{t('organization.empty')}</CommandEmpty>
						<CommandGroup className='application-dropdown-container'>
							<div className='application-dropdown-options'>
								{applications.map((app) => (
									<CommandItem
										key={app._id}
										value={app._id}
										onSelect={() => {
											selectApplication(app);
											setOpen(false);
										}}
										className='application-dropdown-option'
									>
										<ApplicationLabel application={app} />
										<Check
											size={16}
											className={cn(
												'text-icon-base',
												application?._id === app?._id ? 'opacity-100 ' : 'opacity-0',
											)}
											weight='bold'
										/>
									</CommandItem>
								))}
							</div>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup className='application-dropdown-footer'>
							<CommandItem>
								<Button
									variant='secondary'
									size='full'
									onClick={() => {
										setOpenCreateModal(true);
										setOpen(false);
									}}
								>
									<Plus size={16} className='mr-2' />
									{t('application.create')}
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
					<Avatar size='3xl'>
						<AvatarFallback color='#9B7B0866' />
					</Avatar>
				}
				action={
					<div className='flex  items-center justify-center gap-4'>
						<Button variant='text' size='lg' onClick={() => setOpenModal(false)}>
							{t('general.cancel')}
						</Button>
						<Button size='lg' variant='primary'>
							{t('general.ok')}
						</Button>
					</div>
				}
				title={t('organization.leave.main')}
				description={t('organization.leave.description', {
					name: application?.name,
				})}
			/>
			<OrganizationCreateModal
				isOpen={openCreateModal}
				closeModal={() => setOpenCreateModal(false)}
			/>
		</>
	);
}

const ApplicationLabel = ({ application }: { application: Application | null }) => {
	const { user } = useAuthStore();

	return (
		<div className='application-label'>
			<Avatar className='mr-2' size='sm' square>
				<AvatarImage src={application?.pictureUrl} alt={application?.name} />
				<AvatarFallback name={application?.name} color={application?.color as string} />
			</Avatar>
			<div className='application-dropdown-label'>
				<div className='application-dropdown-name'>{application?.name}</div>
				<div className='application-dropdown-desc'>
					{application?.team.find((team) => team.userId._id === user?._id)?.role}
				</div>
			</div>
		</div>
	);
};
