import { OrganizationCreateButton } from '@/features/organization';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './organization.scss';
import { Button } from '@/components/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect } from 'react';
export default function OrganizationSelect() {
	const { organizations, selectOrganization, getAllOrganizationByUser } = useOrganizationStore();
	const { user } = useAuthStore();
	const { openOrgCreateModal } = useOutletContext<{
		openOrgCreateModal: () => void;
	}>();

	const navigate = useNavigate();
	const { t } = useTranslation();

	function handleClickOrganization(org: Organization) {
		selectOrganization(org);
		navigate(`/organization/${org?._id}`);
	}

	useEffect(() => {
		getAllOrganizationByUser();
	}, []);

	console.log(organizations);

	return (
		<div className='p-6'>
			<div className='select-organization-container'>
				<h1 className='select-organization-title'>{t('organization.select')}</h1>
				<div className='select-organization-items'>
					{user?.canCreateOrg && <OrganizationCreateButton onClick={openOrgCreateModal} />}
					{organizations.length > 0 &&
						organizations.map((organization) => (
							<Button
								variant='blank'
								onClick={() => handleClickOrganization(organization)}
								key={organization?._id}
								className='select-organization-button'
							>
								<div className='select-organization-item'>
									<Avatar size='4xl' square>
										<AvatarImage src={organization.pictureUrl} alt={organization.name} />
										<AvatarFallback name={organization?.name} color={organization?.color} />
									</Avatar>
									<div className='select-organization-info'>
										<p className='select-organization-name'>{organization?.name}</p>
										<p className='select-organization-role'>{organization?.role}</p>
									</div>
								</div>
							</Button>
						))}
				</div>
			</div>
		</div>
	);
}
