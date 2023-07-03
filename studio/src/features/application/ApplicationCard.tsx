import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Application } from '@/types';
import { getRelativeTime } from '@/utils/utils';
import { useTranslation } from 'react-i18next';
import { ApplicationTeam } from '.';
import ApplicationSettings from './ApplicationSettings';
import './application.scss';
interface ApplicationCardProps {
	application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
	const { user } = useAuthStore();
	const { t } = useTranslation();

	const role = application.team.find((member) => member._id !== user?._id)?.role;
	return (
		<div
			className='application-card'
			onClick={(e) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				if (e.target.id === 'delete-app' || e.target.id === 'leave-app') return;
				useOrganizationStore.setState({ isVersionOpen: true });
			}}
			role='button'
			tabIndex={0}
			aria-hidden='true'
		>
			<div className='flex items-center gap-4'>
				<Avatar size='2xl' square>
					<AvatarImage src={application.pictureUrl} />
					<AvatarFallback name={application.name} color={application.color} />
				</Avatar>
				<div className='flex flex-col justify-center gap-1 flex-1'>
					<div className='flex items-center justify-between'>
						<span className='text-xl text-default font-semibold block truncate max-w-[11ch]'>
							{application.name}
						</span>
						<Badge text={role as string} />
					</div>
					<div>
						<ApplicationTeam team={application.team} />
					</div>
				</div>
			</div>
			<div className=' flex items-center justify-between self-end'>
				<span className='text-subtle font-sfCompact text-xs'>
					{t('general.created')} {getRelativeTime(application.createdAt)}
				</span>
				<ApplicationSettings appId={application._id} appName={application.name} />
			</div>
		</div>
	);
}
