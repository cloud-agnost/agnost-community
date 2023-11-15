import { DateText } from '@/components/DateText';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { useTranslation } from 'react-i18next';
export default function LastDeployment() {
	const { t } = useTranslation();
	const { environment } = useEnvironmentStore();
	const { members } = useOrganizationStore();
	const user = members.find((member) => member.member._id === environment?.updatedBy);

	function intersectStatus() {
		if (
			Object.values(environment).some(
				(status) => status === 'Deploying' || status === 'Redeploying',
			)
		) {
			return 'Deploying';
		}

		if (Object.values(environment).some((status) => status === 'Error')) {
			return 'Error';
		}
		return 'OK';
	}
	return (
		<div className='w-full space-y-2 pl-4 pr-8 py-2'>
			<div className='text-subtle text-sm font-sfCompact leading-6 flex justify-between gap-4'>
				<p>{t('version.last_deployment')}</p>
				<p>{t('version.status')}</p>
			</div>
			<div className='text-white divide-y'>
				<div className='py-[9px] space-y-4'>
					<div className='flex items-center justify-between gap-4'>
						{environment?.deploymentDtm && (
							<DateText user={user} date={environment?.deploymentDtm} />
						)}
						<Badge
							rounded
							variant={BADGE_COLOR_MAP[intersectStatus().toUpperCase()]}
							text={intersectStatus()}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}