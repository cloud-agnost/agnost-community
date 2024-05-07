import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { BADGE_COLOR_MAP } from '@/constants';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import { AppRoles, Application } from '@/types';
import { cn, getRelativeTime } from '@/utils';
import { useTranslation } from 'react-i18next';

import ApplicationSettings from './ApplicationSettings';
import ApplicationTeam from './ApplicationTeam';
import './application.scss';
import { Loading } from '@/components/Loading';
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
		<button
			className='application-card relative space-y-3'
			onClick={(e) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				if (e.target.id === 'open-version' || !e.target.id) onAppClick(application);
			}}
		>
			{loading && application._id === selectedApp?._id && (
				<>
					<Loading loading={loading} />
					<div
						className={cn(
							'absolute bg-base/50 w-full h-full z-40',
							loading ? 'transition-all duration-100 fade-in' : 'animate-out fade-out',
						)}
					/>
				</>
			)}

			<div className='flex items-center gap-2'>
				<Avatar size='md' square>
					<AvatarImage src={application.pictureUrl} />
					<AvatarFallback name={application.name} color={application.color} />
				</Avatar>
				<p className='text-xl text-default font-semibold block truncate'>{application.name}</p>
			</div>

			<ApplicationTeam team={application.team} />
			<Badge text={role} variant={BADGE_COLOR_MAP[role?.toUpperCase()]} className='flex  w-1/6' />
			<div className='flex items-center justify-between'>
				<span className='text-subtle font-sfCompact text-xs'>
					{t('general.created')} {getRelativeTime(application.createdAt)}
				</span>
				<ApplicationSettings appId={application._id} role={role as AppRoles} />
			</div>
		</button>
	);
}
