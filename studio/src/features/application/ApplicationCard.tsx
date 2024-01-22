import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { BADGE_COLOR_MAP } from '@/constants';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import { AppRoles, Application } from '@/types';
import { cn, getRelativeTime } from '@/utils';
import { useTranslation } from 'react-i18next';
import BeatLoader from 'react-spinners/BeatLoader';
import ApplicationSettings from './ApplicationSettings';
import ApplicationTeam from './ApplicationTeam';
import './application.scss';
interface ApplicationCardProps {
	application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
	const { user } = useAuthStore();
	const { t } = useTranslation();
	const { onAppClick, loading, application: selectedApp } = useApplicationStore();
	const role = user.isClusterOwner
		? AppRoles.Admin
		: (application.team?.find(({ userId }) => userId._id === user?._id)?.role as string);
	return (
		<div
			className='application-card relative'
			onClick={(e) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				if (e.target.id === 'open-version' || !e.target.id) onAppClick(application);
			}}
			role='button'
			tabIndex={0}
			aria-hidden='true'
		>
			{loading && application._id === selectedApp?._id && (
				<>
					<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10'>
						<BeatLoader color='#6884FD' size={16} margin={12} />
					</div>
					<div
						className={cn(
							'absolute bg-base/50 w-full h-full z-40',
							loading ? 'transition-all duration-100 fade-in' : 'animate-out fade-out',
						)}
					/>
				</>
			)}

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
