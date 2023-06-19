import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Application } from '@/types';
import { DateTime } from 'luxon';
import ApplicationSettings from './ApplicationSettings';
import './application.scss';

export default function ApplicationCard({ application }: { application: Application }) {
	return (
		<div className='application-card'>
			<div className='badge py-1 px-1.5 bg-elements-strong-purple inline-flex justify-center items-center'>
				<span className='text-xs text-white font-sfCompact'>Developer</span>
			</div>
			<div className='flex items-center gap-4 mt-4 mb-2'>
				<Avatar size='lg' square>
					<AvatarImage src={application.pictureUrl} />
					<AvatarFallback name={application.name} color={application.color} />
				</Avatar>
				<div className='flex flex-col justify-center gap-2'>
					<span className='text-xl text-default font-semibold'>{application.name}</span>
					<div>
						{application.team.map((member) => (
							<Avatar key={member._id} size='xs'>
								{/* <AvatarImage src={member?.pictureUrl} /> */}
								<AvatarFallback name='Enes Malik Ozer' color='#123456' isUserAvatar />
							</Avatar>
						))}
					</div>
				</div>
			</div>
			<div className=' flex items-center justify-between'>
				<span className='text-subtle font-sfCompact text-xs'>
					Create {DateTime.fromISO(application.createdAt).setLocale('en').toRelative()}
				</span>
				<ApplicationSettings />
			</div>
		</div>
	);
}
