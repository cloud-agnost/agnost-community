import { Avatar, AvatarFallback } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { InfoModal } from '@/components/InfoModal';
import { OrganizationCreateModal } from '@/features/organization';
import useApplicationStore from '@/store/app/applicationStore';
import { Version } from '@/types';
import { CaretUpDown } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import './versionDropdown.scss';

export default function VersionDropdown() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const { application } = useApplicationStore();
	const navigate = useNavigate();
	const { appId, orgId, versionId } = useParams();

	const versionTabs = [
		{
			title: t('version.open_version'),
			action: () => {
				navigate(`/organization/${orgId}/apps/${appId}/version/${versionId}`);
			},
			disabled: false,
		},
		{
			title: t('version.create_a_copy'),
			action: () => {
				// TODO: implement
			},
			disabled: false,
		},
		{
			title: t('version.merge'),
			action: () => {
				// TODO: implement
			},
			disabled: true,
			after: <DropdownMenuSeparator />,
		},
		{
			title: t('version.export'),
			action: () => {
				// TODO: implement
			},
			disabled: true,
		},
		{
			title: t('version.import'),
			action: () => {
				// TODO: implement
			},
			disabled: true,
			after: <DropdownMenuSeparator />,
		},
		{
			title: t('version.mark_read_only'),
			action: () => {
				// TODO: implement
			},
			disabled: false,
		},
		{
			title: t('version.set_private'),
			action: () => {
				// TODO: implement
			},
			disabled: false,
		},
		{
			title: t('version.settings'),
			action: () => {
				// TODO: implement
			},
			disabled: false,
			after: <DropdownMenuSeparator />,
		},
		{
			title: t('version.delete'),
			action: () => {
				// TODO: implement
			},
			disabled: false,
		},
	];

	return (
		<>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<div className='version-dropdown'>
						<VersionLabel version={null} />
						<Button
							variant='blank'
							role='combobox'
							aria-expanded={open}
							className='version-dropdown-button'
							rounded
						>
							<div className='version-dropdown-icon'>
								<CaretUpDown size={20} />
							</div>
						</Button>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='center' className='version-dropdown-content'>
					<DropdownMenuItemContainer>
						{versionTabs.map((option, index) => (
							<Fragment key={index}>
								<DropdownMenuItem disabled={option.disabled} onClick={option.action}>
									{option.title}
								</DropdownMenuItem>
								{option.after}
							</Fragment>
						))}
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>

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

const VersionLabel = ({}: { version?: Version | null }) => {
	return <div className='version-label text-default'>Version</div>;
};
