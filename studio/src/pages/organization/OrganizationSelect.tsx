import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { OrganizationCreateButton } from '@/features/organization';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import './organization.scss';
import { EmptyState } from '@/components/EmptyState';
import { useEffect } from 'react';
import { AuthUserDropdown } from '@/features/auth/AuthUserDropdown';
import { ReleaseDropdown } from '@/features/cluster';
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

	return (
		<div className='p-6 relative'>
			<div className='absolute right-6 flex items-center gap-4'>
				<ReleaseDropdown />
				<AuthUserDropdown />
			</div>
			<div className='select-organization-container'>
				{!!organizations.length && (
					<h1 className='select-organization-title'>{t('organization.select')}</h1>
				)}
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
					{organizations.length === 0 && !user?.canCreateOrg && (
						<EmptyState type='org' title={t('organization.empty_organization')}>
							<p className='text-default'>{t('organization.empty_organization_desc')}</p>
						</EmptyState>
					)}
				</div>
			</div>
		</div>
	);
}
