import useEnvironmentStore from '@/store/environment/environmentStore';
import { formatDate } from '@/utils';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP, RESOURCE_ICON_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';
export default function Resources() {
	const { t } = useTranslation();
	const { resources } = useEnvironmentStore();

	function getIcon(type: string) {
		const Icon = RESOURCE_ICON_MAP[type];
		return <Icon className='w-8 h-8' />;
	}
	return (
		<div className='w-full space-y-2 max-h-[200px] px-4 py-2 overflow-auto'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.resources')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				{resources.map((resource, index) => (
					<div key={index} className='py-[9px] flex justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<span className='w-10 h-10 rounded-full bg-lighter flex items-center justify-center p-2'>
								{getIcon(resource.instance)}
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
