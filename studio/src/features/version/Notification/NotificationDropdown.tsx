import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Notification, TabTypes } from '@/types';
import { cn, generateId, getRelativeTime } from '@/utils';
import { Bell, GearSix } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export default function NotificationDropdown() {
	const { t } = useTranslation();
	const { notificationsPreview, updateNotificationLastSeen, getVersionNotificationsPreview } =
		useVersionStore();
	const { getVersionDashboardPath, version } = useVersionStore();
	const { addTab } = useTabStore();
	const { orgId, versionId, appId } = useParams() as Record<string, string>;
	function seeAllNotifications() {
		const versionHomePath = getVersionDashboardPath('/notifications');
		addTab(version?._id, {
			id: generateId(),
			title: t('version.notifications'),
			path: versionHomePath,
			isActive: true,
			isDashboard: false,
			type: TabTypes.Notifications,
		});
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}

	useEffect(() => {
		if (orgId && versionId && appId) {
			getVersionNotificationsPreview({
				appId,
				orgId,
				versionId,
				page: 0,
				size: 100,
				sortBy: 'createdAt',
				sortDir: 'desc',
			});
		}
	}, [versionId]);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='icon' className='relative'>
					<Bell size={24} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className={cn('relative p-0 w-[24rem] mr-4  divide-y-2')}>
				<DropdownMenuLabel className='relative flex justify-between items-center p-4'>
					<p className='truncate text-default'>{t('version.notifications')}</p>
					<Button variant='blank' className='link' onClick={updateNotificationLastSeen}>
						{t('version.mark_all_as_read')}
					</Button>
				</DropdownMenuLabel>
				<div className='space-y-2 divide-y-2 max-h-[33rem] overflow-auto'>
					{notificationsPreview.map((notification) => (
						<NotificationItem notification={notification} key={notification._id} />
					))}
				</div>
				<footer className='flex items-center justify-between px-4 py-1'>
					<div className='p-2 hover:bg-button-border-hover rounded-full'>
						<Link to={`/organization/${orgId}/profile/notifications`}>
							<GearSix size={20} className=' text-icon-secondary' />
						</Link>
					</div>
					<Button variant='link' onClick={seeAllNotifications}>
						{t('version.view_all_notifications')}
					</Button>
				</footer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function NotificationItem({ notification }: { notification: Notification }) {
	const { notificationLastSeen } = useVersionStore();
	return (
		<div className='py-3 px-4 relative flex items-center gap-4'>
			<Avatar size='sm' className='self-start'>
				<AvatarImage src={notification.actor.pictureUrl as string} />
				<AvatarFallback
					isUserAvatar
					color={notification.actor.color as string}
					name={notification.actor.name}
					className='text-sm'
				/>
			</Avatar>
			<div className='space-y-3 flex-1'>
				<div className='space-x-2'>
					<span className='text-default font-sfCompact'>{notification.actor.name}</span>
					<Description description={notification.description} />
				</div>
				<div className='text-subtle text-xs'>{getRelativeTime(notification.createdAt)}</div>
			</div>
			{notificationLastSeen < new Date(notification.createdAt) && (
				<div className='w-2 h-2 rounded-full bg-elements-blue' />
			)}
		</div>
	);
}

function Description({ description }: { description: string }) {
	const regex = /'([^']+)'/g;
	let lastIndex = 0;
	const elements = [];

	while (description.length > lastIndex) {
		const match = regex.exec(description);
		if (!match) break;

		// Text before the quoted text
		const textBefore = description.substring(lastIndex, match.index);
		if (textBefore) {
			elements.push(<span className='text-subtle font-sfCompact text-sm'>{textBefore}</span>);
		}

		elements.push(
			<span key={match.index} className='text-subtle font-bold font-sfCompact text-sm'>
				{match[0].replace(/'/g, '')}
			</span>,
		);

		lastIndex = match.index + match[0].length;
	}

	const textAfter = description.substring(lastIndex);
	if (textAfter) {
		elements.push(<span className='text-subtle font-sfCompact text-sm'>{textAfter}</span>);
	}

	return <div className='inline break-words'>{elements}</div>;
}
