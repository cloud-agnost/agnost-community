import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Link } from 'react-router-dom';

async function loader() {
	return useOrganizationStore.getState().getAllOrganizationByUser();
}

export default function SelectOrganization() {
	const { organizations } = useOrganizationStore();
	return (
		<div>
			{organizations.length > 0 && (
				<div className='my-10 md:my-0'>
					<div className='flex flex-col items-center justify-center gap-8 lg:gap-20 md:h-screen'>
						<h1 className='text-default text-xl md:text-3xl font-semibold tracking-md'>
							Select Your Organization
						</h1>
						<div className='max-w-sm sm:max-w-lg lg:max-w-xl'>
							<div className='flex flex-wrap justify-center gap-x-16 gap-y-8 md:gap-16 lg:gap-24'>
								{organizations.map((organization) => (
									<Link to={`/organization/${organization?._id}`} key={organization?._id}>
										<Avatar size='xl'>
											<AvatarImage />
											<AvatarFallback name={organization?.name} color={organization?.color} />
										</Avatar>
									</Link>
								))}
								{/* {user?.canCreateCompany && <CompanyButton label='Create company' isCreateCompany />} */}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

SelectOrganization.loader = loader;
