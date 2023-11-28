import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import { AppRoles, Application } from '@/types';
import { getRelativeTime } from '@/utils';
import { useTranslation } from 'react-i18next';
import ApplicationTeam from './ApplicationTeam';
import ApplicationSettings from './ApplicationSettings';
import './application.scss';
import { BADGE_COLOR_MAP } from '@/constants';
interface ApplicationCardProps {
	application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
	const { user } = useAuthStore();
	const { t } = useTranslation();
	const { openVersionDrawer } = useApplicationStore();

	const role = application.team?.find(({ userId }) => userId._id === user?._id)?.role as string;
	return (
		<div
			className='application-card'
			onClick={(e) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				if (e.target.id === 'open-version' || !e.target.id) openVersionDrawer(application);
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
						<Badge text={role} variant={BADGE_COLOR_MAP[role?.toUpperCase()]} />
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
				<ApplicationSettings
					appId={application._id}
					appName={application.name}
					role={role as AppRoles}
				/>
			</div>
		</div>
	);
}
