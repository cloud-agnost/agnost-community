import { Button } from '@/components/Button';
import { DropdownMenuItem } from '@/components/Dropdown';
import { InfoModal } from '@/components/InfoModal';
import { SelectionDropdown } from '@/components/SelectionDropdown';
import { OrganizationCreateModal } from '@/features/organization';
import { useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError, Organization } from '@/types';
import { Plus } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './organization.scss';
export function OrganizationDropdown() {
	const { t } = useTranslation();
	const { user } = useAuthStore();
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
	const { getAppsByOrgId } = useApplicationStore();
	const { toast } = useToast();

	const { mutate: leaveOrgMutate, isPending } = useMutation({
		mutationFn: leaveOrganization,
		onSuccess: () => {
			toast({
				title: t('organization.leave.success.title', {
					name: organization?.name,
				}) as string,
				action: 'success',
			});
			setOpenModal(false);
			navigate('/organization');
		},
		onError: ({ details }: APIError) => {
			toast({
				title: details,
				action: 'error',
			});
		},
	});
	function handleLeave() {
		leaveOrgMutate({
			organizationId: organization?._id,
		});
	}

	function onSelect(org: Organization) {
		getAppsByOrgId(org._id);
		navigate(`/organization/${org?._id}`);
		selectOrganization(org);
	}

	useEffect(() => {
		if (_.isEmpty(organizations)) {
			getAllOrganizationByUser();
		}
	}, []);

	return (
		<>
			<SelectionDropdown
				data={organizations}
				selectedData={organization}
				onSelect={(org) => onSelect(org as Organization)}
				onClick={() => navigate(`/organization/${organization?._id}`)}
			>
				<DropdownMenuItem className='flex !justify-center'>
					<Button
						disabled={organization?.ownerUserId === user?._id}
						className='w-full font-normal'
						variant='text'
						onClick={() => setOpenModal(true)}
					>
						{t('organization.leave.main')}
					</Button>
				</DropdownMenuItem>
				<DropdownMenuItem className='hover:bg-[unset]'>
					<Button
						size='full'
						disabled={!user?.isClusterOwner}
						variant='primary'
						onClick={() => setOpenCreateModal(true)}
					>
						<Plus size={14} className='mr-2' />
						{t('organization.create')}
					</Button>
				</DropdownMenuItem>
			</SelectionDropdown>

			<InfoModal
				isOpen={openModal}
				closeModal={() => setOpenModal(false)}
				onConfirm={handleLeave}
				title={t('organization.leave.main')}
				description={t('organization.leave.description', {
					name: organization?.name,
				})}
				loading={isPending}
			/>
			<OrganizationCreateModal
				key={openCreateModal.toString()}
				isOpen={openCreateModal}
				closeModal={() => setOpenCreateModal(false)}
			/>
		</>
	);
}
