import { Button } from '@/components/Button';
import { Command, CommandGroup, CommandItem, CommandSeparator } from '@/components/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { APPLICATION_SETTINGS } from '@/constants';
import useOrganizationStore from '@/store/organization/organizationStore';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks';
import { InfoModal } from '@/components/InfoModal';
import { Avatar, AvatarFallback } from '@/components/Avatar';
import { Application } from '@/types';
import useApplicationStore from '@/store/app/applicationStore.ts';
interface ApplicationSettingsProps {
	appId: string;
	appName: string;
}
interface InformationModal {
	title: string;
	description: string;
	onConfirm?: () => void;
}
export default function ApplicationSettings({ appId, appName }: ApplicationSettingsProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [modalInfo, setModalInfo] = useState<InformationModal>({
		title: '',
		description: '',
		onConfirm: () => {
			return;
		},
	});
	const [openInfoModal, setOpenInfoModal] = useState(false);
	const { organization } = useOrganizationStore();
	const { deleteApplication, leaveAppTeam } = useApplicationStore();

	const { notify } = useToast();
	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='text'
						rounded
						className='p-2'
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						<DotsThreeVertical className='w-5 h-5 text-icon-secondary' />
						<span className='sr-only'>Open popover</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[181px]'>
					<Command>
						<CommandGroup>
							{APPLICATION_SETTINGS.map((setting) => (
								<CommandItem
									id={setting.id}
									key={setting.name}
									onSelect={() => {
										setOpen(false);
										if (setting.onClick)
											setting.onClick(
												useApplicationStore
													.getState()
													.applications.find((app) => app._id === appId) as Application,
											);
									}}
									className='font-sfCompact px-3'
								>
									{setting.name}
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								id='delete-app'
								onSelect={() => {
									setOpen(false);
									setOpenInfoModal(true);
									setModalInfo({
										title: t('application.leave.title'),
										description: t('application.leave.description', {
											name: appName,
										}),
										onConfirm: () => {
											setOpenInfoModal(false);
											leaveAppTeam({
												appId,
												orgId: organization?._id as string,
												onError: ({ error, details }) => {
													notify({
														title: error,
														description: details,
														type: 'error',
													});
												},
											});
										},
									});
								}}
								className='font-sfCompact px-3'
							>
								{t('application.settings.leaveTeam')}
							</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem
								id='leave-app'
								onSelect={() => {
									setOpen(false);
									setOpenInfoModal(true);
									setModalInfo({
										title: t('application.delete.title'),
										description: t('application.delete.description', {
											name: appName,
										}),
										onConfirm: () => {
											setOpenInfoModal(false);
											deleteApplication({
												appId,
												orgId: organization?._id as string,
												onError: ({ error, details }) => {
													notify({
														title: error,
														description: details,
														type: 'error',
													});
												},
											});
										},
									});
								}}
								className='font-sfCompact px-3'
							>
								{t('general.delete')}
							</CommandItem>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
			<InfoModal
				isOpen={openInfoModal}
				closeModal={() => setOpenInfoModal(false)}
				title={modalInfo.title}
				description={modalInfo.description}
				icon={
					<Avatar size='3xl'>
						<AvatarFallback color='#9B7B0866' />
					</Avatar>
				}
				action={
					<div className='flex  items-center justify-center gap-4'>
						<Button
							variant='text'
							size='lg'
							onClick={(e) => {
								e.stopPropagation();
								setOpenInfoModal(false);
							}}
						>
							{t('general.cancel')}
						</Button>
						<Button
							size='lg'
							variant='primary'
							onClick={(e) => {
								e.stopPropagation();
								modalInfo.onConfirm?.();
							}}
						>
							{t('general.ok')}
						</Button>
					</div>
				}
			/>
		</>
	);
}
