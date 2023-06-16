import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Slider } from '@/components/Slider';
import { OrganizationCreateButton, OrganizationCreateModal } from '@/features/Organization';
import useOrganizationStore from '@/store/organization/organizationStore';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore';
import './organization.scss';
import { useTranslation } from 'react-i18next';

async function loader() {
	return useOrganizationStore.getState().getAllOrganizationByUser();
}

export default function SelectOrganization() {
	const { organizations } = useOrganizationStore();
	const [isOpen, setIsOpen] = useState(false);
	const { user } = useAuthStore();
	const { t } = useTranslation();
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
											<Link to={`/organization/${organization?._id}`} key={organization?._id}>
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
											</Link>
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

SelectOrganization.loader = loader;
