import { Database, MessageQueue, Storage, Cache, ApiKeys, Calendar } from 'components/icons';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { formatDate } from '@/utils';
export default function Resources() {
	const { t } = useTranslation();
	const { resources } = useEnvironmentStore();

	function getIcon(type: string) {
		switch (type) {
			case 'database':
				return <Database className='w-5 h-5' />;
			case 'storage':
				return <Storage className='w-5 h-5' />;
			case 'message-queue':
				return <MessageQueue className='w-5 h-5' />;
			case 'cache':
				return <Cache className='w-5 h-5' />;
			case 'engine':
				return <ApiKeys className='w-5 h-5' />;
			case 'task':
				return <Calendar className='w-5 h-5' />;

			default:
				return null;
		}
	}
	return (
		<div className='w-full space-y-2'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.resources')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				{resources.map((resource, index) => (
					<div key={index} className='py-[9px] flex justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<span className='w-10 h-10 rounded-full bg-lighter flex items-center justify-center p-2'>
								{getIcon(resource.type)}
							</span>
							<div className='flex flex-col'>
								<p className='text-sm font-sfCompact font-normal leading-6 text-default'>
									{resource.name}
								</p>
								<time className='font-sfCompact text-[11px] leading-[21px] tracking-[0.22px] text-subtle font-normal'>
									{formatDate(resource.createdAt, {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</time>
							</div>
						</div>
						<div className='flex items-center'>
							<Badge
								rounded
								variant={BADGE_COLOR_MAP[resource.status.toUpperCase()]}
								text={resource.status}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
