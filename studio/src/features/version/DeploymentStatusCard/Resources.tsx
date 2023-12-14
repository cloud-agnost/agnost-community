import useEnvironmentStore from '@/store/environment/environmentStore';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP, RESOURCE_ICON_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT_MONTH_DAY_YEAR, formatDate } from '@/utils';
export default function Resources() {
	const { t } = useTranslation();
	const { resources } = useEnvironmentStore();

	function getIcon(type: string) {
		const Icon = RESOURCE_ICON_MAP[type];
		return <Icon className='w-8 h-8' />;
	}
	return (
		<div className='w-full space-y-2 max-h-[300px] px-4 py-2 overflow-y-scroll'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.resources')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				{resources.map((resource) => (
					<div key={resource._id} className='py-[9px] flex justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<span className='w-10 h-10 rounded-full bg-lighter flex items-center justify-center p-2'>
								{getIcon(resource.instance)}
							</span>
							<div className='flex flex-col'>
								<p className='text-sm font-sfCompact font-normal leading-6 text-default'>
									{resource.name}
								</p>
								<time className='font-sfCompact text-[11px] leading-[21px] tracking-[0.22px] text-subtle font-normal'>
									{formatDate(resource.createdAt, DATE_FORMAT_MONTH_DAY_YEAR)}
								</time>
							</div>
						</div>
						<div className='flex items-center'>
							<Badge
								rounded
								variant={BADGE_COLOR_MAP[resource.status?.toUpperCase()]}
								text={resource.status}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
