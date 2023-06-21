import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import useAuthStore from '@/store/auth/authStore';
import { Application } from '@/types';
import { getRelativeTime } from '@/utils/utils';
import { ApplicationTeam } from '.';
import ApplicationSettings from './ApplicationSettings';
import './application.scss';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/Badge';
import { getApplicationRoleVariant } from '@/utils';
import { Button } from '@/components/Button';
import useOrganizationStore from '@/store/organization/organizationStore';
interface ApplicationCardProps {
	application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
	const { user } = useAuthStore();
	const { t } = useTranslation();

	const role = application.team.find((member) => member._id !== user?._id)?.role;
	return (
		<button onClick={() => useOrganizationStore.setState({ isVersionOpen: true })}>
			<div className='application-card'>
				<div className='flex items-center gap-4 flex-1'>
					<Avatar size='lg' square>
						<AvatarImage src={application.pictureUrl} />
						<AvatarFallback name={application.name} color={application.color} />
					</Avatar>
					<div className='flex flex-col justify-center gap-1 flex-1'>
						<div className='flex items-center justify-between'>
							<span className='text-xl text-default font-semibold block truncate max-w-[12ch]'>
								{application.name}
							</span>
							<Badge variant={getApplicationRoleVariant(role as string)}>{role}</Badge>
						</div>
						<div>
							<ApplicationTeam team={application.team} />
						</div>
					</div>
				</div>
				<div className=' flex items-center justify-between'>
					<span className='text-subtle font-sfCompact text-xs'>
						{t('general.created')} {getRelativeTime(application.createdAt)}
					</span>
					<ApplicationSettings appId={application._id} appName={application.name} />
				</div>
			</div>
		</button>
	);
}
