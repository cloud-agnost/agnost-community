import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Slider } from '@/components/Slider';
import { OrganizationCreateButton } from '@/features/organization';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import './organization.scss';
import { useEffect } from 'react';

async function loader() {
	return null;
}

export default function OrganizationSelect() {
	const { organizations, selectOrganization, getAllOrganizationByUser } = useOrganizationStore();
	const { user, isAuthenticated } = useAuthStore();
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
		if (isAuthenticated()) {
			getAllOrganizationByUser();
		}
	}, [user?._id, isAuthenticated]);

	return (
		<div>
			<>
				<div className='select-organization-container'>
					<h1 className='select-organization-title'>{t('organization.select')}</h1>

					<div className='select-organization-slider'>
						{organizations.length > 0 && (
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
										),
									};
								})}
							/>
						)}
						{user?.canCreateOrg && <OrganizationCreateButton onClick={openOrgCreateModal} />}
					</div>
				</div>
			</>
		</div>
	);
}

OrganizationSelect.loader = loader;
