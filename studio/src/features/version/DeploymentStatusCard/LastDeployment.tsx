import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { getRelativeTime } from '@/utils';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';
export default function LastDeployment() {
	const { t } = useTranslation();

	return (
		<div className='w-full space-y-2 p-4'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.last_deployment')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				<div className='py-[9px] space-y-4'>
					<EnvStatus title={t('general.dbStatus')} type='dbStatus' />
					<EnvStatus title={t('general.serverStatus')} type='serverStatus' />
					<EnvStatus title={t('general.schedulerStatus')} type='schedulerStatus' />
				</div>
			</div>
		</div>
	);
}

function EnvStatus({
	title,
	type,
}: {
	title: string;
	type: 'dbStatus' | 'serverStatus' | 'schedulerStatus';
}) {
	const { environment } = useEnvironmentStore();
	const { members } = useOrganizationStore();
	const user = members.find((member) => member.member._id === environment?.updatedBy)?.member;
	return (
		<div className='flex items-center justify-between gap-4'>
			<div className='space-y-2'>
				<p className='text-default font-sfCompact text-sm leading-6'>{title}</p>
				{environment?.deploymentDtm && (
					<div className='flex items-center gap-2'>
						<Avatar size='xs'>
							<AvatarImage src={user?.pictureUrl} />
							<AvatarFallback isUserAvatar color={user?.color as string} name={user?.name} />
						</Avatar>
						<div className='space-x-2'>
							<span className='text-default text-sm font-sfCompact'>{user?.name}</span>
							<span className='text-subtle text-xs font-sfCompact'>
								{getRelativeTime(environment?.deploymentDtm)}
							</span>
						</div>
					</div>
				)}
			</div>
			<Badge
				rounded
				variant={BADGE_COLOR_MAP[environment?.[type]?.toUpperCase()]}
				text={environment?.[type]}
			/>
		</div>
	);
}
