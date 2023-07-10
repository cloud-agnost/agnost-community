import { Database, MessageQueue, Storage } from 'components/icons';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';

const resources = [
	{
		icon: <Database className='w-full h-full' />,
		title: 'HR Database',
		time: '03:39 PM',
		status: 'Ok',
	},
	{
		icon: <MessageQueue className='w-full h-full' />,
		title: 'HR Database',
		time: '03:39 PM',
		status: 'Deploying',
	},
	{
		icon: <Storage className='w-full h-full' />,
		title: 'HR Database',
		time: '03:39 PM',
		status: 'Error',
	},
];

export default function Resources() {
	const { t } = useTranslation();
	return (
		<div className='w-full space-y-2 p-4'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.resources')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				{resources.map((resource, index) => (
					<div key={index} className='py-[9px] flex justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<span className='w-10 h-10 rounded-full bg-lighter flex items-center justify-center p-2'>
								{resource.icon}
							</span>
							<div className='flex flex-col'>
								<p className='text-sm font-sfCompact font-normal leading-6 text-default'>
									{resource.title}
								</p>
								<time className='font-sfCompact text-[11px] leading-[21px] tracking-[0.22px] text-subtle font-normal'>
									{resource.time}
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
