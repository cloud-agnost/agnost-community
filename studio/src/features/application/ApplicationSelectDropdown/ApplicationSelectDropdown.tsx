import { Button } from '@/components/Button';
import { CommandItem } from '@/components/Command';
import { SelectionDropdown } from '@/components/SelectionDropdown';
import ApplicationCreateModal from '@/features/application/ApplicationCreateModal.tsx';
import useApplicationStore from '@/store/app/applicationStore';
import { Application } from '@/types';
import { Plus } from '@phosphor-icons/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import './appSelectDropdown.scss';
import { DropdownMenuItem } from '@/components/Dropdown';

export default function ApplicationSelectDropdown() {
	const { t } = useTranslation();
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const { applications, application, openEditAppDrawer, getAppsByOrgId } = useApplicationStore();
	const { onAppClick } = useApplicationStore();
	const { orgId } = useParams();
	function onSelect(app: Application) {
		if (app._id === application?._id) return;
		onAppClick(app);
	}

	useEffect(() => {
		if (_.isEmpty(applications) && orgId) {
			getAppsByOrgId(orgId);
		}
	}, [orgId]);

	return (
		<>
			<SelectionDropdown
				selectedData={application as Application}
				data={applications}
				onSelect={(app) => onSelect(app as Application)}
				onClick={() => openEditAppDrawer(application as Application)}
			>
				<DropdownMenuItem asChild>
					<Button variant='primary' onClick={() => setOpenCreateModal(true)}>
						<Plus size={14} className='mr-2' />
						{t('application.create')}
					</Button>
				</DropdownMenuItem>
			</SelectionDropdown>

			<ApplicationCreateModal
				key={openCreateModal.toString()}
				isOpen={openCreateModal}
				closeModal={() => setOpenCreateModal(false)}
			/>
		</>
	);
}
