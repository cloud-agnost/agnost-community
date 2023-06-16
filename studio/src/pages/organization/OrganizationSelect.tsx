import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Slider } from '@/components/Slider';
import { OrganizationCreateButton, OrganizationCreateModal } from '@/features/Organization';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './organization.scss';

async function loader() {
	return useOrganizationStore.getState().getAllOrganizationByUser();
}

export default function OrganizationSelect() {
	const { organizations, selectOrganization } = useOrganizationStore();
	const [isOpen, setIsOpen] = useState(false);
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const { t } = useTranslation();

	function handleClickOrganization(org: Organization) {
		selectOrganization(org);
		navigate(`/organization/${org?._id}`);
	}

	return (
		<div>
			{organizations.length > 0 && (
				<>
					<div className='select-organization-container'>
						<h1 className='select-organization-title'>{t('organization.select')}</h1>

						<div className='select-organization-slider'>
							<Slider
								slidesPerView={4}
								spaceBetween={32}
								freeMode
								items={organizations.map((organization) => {
									return {
										element: (
											<Button
												variant='blank'
												onClick={() => handleClickOrganization(organization)}
												key={organization?._id}
												className='select-organization-button'
											>
												<div className='select-organization-item'>
													<Avatar size='xl'>
														<AvatarImage src={organization.pictureUrl} alt={organization.name} />
														<AvatarFallback name={organization?.name} color={organization?.color} />
													</Avatar>
													<div className='select-organization-info'>
														<p className='select-organization-name'>{organization?.name}</p>
														<p className='select-organization-role'>{organization?.role}</p>
													</div>
												</div>
											</Button>
										),
									};
								})}
							/>
							{user?.canCreateOrg && (
								<OrganizationCreateButton onClick={() => setIsOpen(!isOpen)} />
							)}
						</div>
					</div>
				</>
			)}
			<OrganizationCreateModal isOpen={isOpen} closeModal={() => setIsOpen(!isOpen)} />
		</div>
	);
}

OrganizationSelect.loader = loader;
