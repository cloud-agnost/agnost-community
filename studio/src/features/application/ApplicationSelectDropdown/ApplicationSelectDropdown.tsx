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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import ApplicationCreateModal from '@/features/application/ApplicationCreateModal.tsx';
import useApplicationStore from '@/store/app/applicationStore';
import { Application } from '@/types';
import { cn } from '@/utils';
import { CaretUpDown, Check, Plus } from '@phosphor-icons/react';
import _ from 'lodash';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import './appSelectDropdown.scss';

export default function ApplicationSelectDropdown() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const { applications, application, openEditAppDrawer, getAppsByOrgId } = useApplicationStore();
	const { onAppClick } = useApplicationStore();
	const { orgId } = useParams();
	function onSelect(app: Application) {
		setOpen(false);
		if (app._id === application?._id) return;
		onAppClick(app);
	}

	useEffect(() => {
		if (_.isEmpty(applications) && orgId) {
			getAppsByOrgId(orgId);
		}
	}, [orgId]);

	const filteredApps = useMemo(() => {
		if (!search) return applications;
		return applications.filter((app) => RegExp(new RegExp(search, 'i')).exec(app.name));
	}, [applications, search]);

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<div className='application-dropdown'>
					<ApplicationLabel
						onClick={() => {
							if (application) openEditAppDrawer(application);
						}}
						application={application}
					/>
					<PopoverTrigger asChild>
						<Button
							variant='blank'
							aria-expanded={open}
							className='application-dropdown-button'
							rounded
						>
							<div className='application-dropdown-icon'>
								<CaretUpDown size={20} />
							</div>
						</Button>
					</PopoverTrigger>
				</div>
				<PopoverContent align='end' className='application-dropdown-content'>
					<Command shouldFilter={false}>
						{applications.length > 5 && (
							<CommandInput
								placeholder={t('application.select') as string}
								value={search}
								onValueChange={setSearch}
							/>
						)}
						<CommandEmpty>{t('organization.empty')}</CommandEmpty>
						<CommandGroup className='application-dropdown-container'>
							<div className='application-dropdown-options'>
								{filteredApps.map((app) => (
									<CommandItem
										key={app._id}
										value={app._id}
										onSelect={() => onSelect(app)}
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
			<ApplicationCreateModal
				key={openCreateModal.toString()}
				isOpen={openCreateModal}
				closeModal={() => setOpenCreateModal(false)}
			/>
		</>
	);
}

interface ApplicationLabelProps {
	application: Application | null;
	onClick?: () => void;
}

const ApplicationLabel = ({ application, onClick }: ApplicationLabelProps) => {
	function openAppSettings(e: MouseEvent<HTMLButtonElement>) {
		if (onClick) {
			e.stopPropagation();
			onClick();
		}
	}

	return (
		<Button onClick={openAppSettings} variant='blank' className='application-label'>
			<Avatar className='mr-2' size='sm' square>
				<AvatarImage src={application?.pictureUrl} alt={application?.name} />
				<AvatarFallback name={application?.name} color={application?.color as string} />
			</Avatar>
			<div className='application-dropdown-label'>
				<div className='application-dropdown-name'>{application?.name}</div>
				<div className='application-dropdown-desc'>{application?.role}</div>
			</div>
		</Button>
	);
};
