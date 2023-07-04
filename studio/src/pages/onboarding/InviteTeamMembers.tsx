import { Button } from '@/components/Button';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import useClusterStore from '@/store/cluster/clusterStore';
import useOnboardingStore from '@/store/onboarding/onboardingStore';
import useTypeStore from '@/store/types/typeStore';
import { APIError, AppMembers } from '@/types/type';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';

async function loader() {
	const { isTypesOk, getAllTypes } = useTypeStore.getState();
	if (!isTypesOk) {
		getAllTypes();
	}
	return null;
}

export default function InviteTeamMembers() {
	const { goBack } = useOutletContext() as { goBack: () => void };
	const { setStepByPath, setDataPartially, data: onboardingReq } = useOnboardingStore();
	const { finalizeClusterSetup } = useClusterStore();
	const { appRoles } = useTypeStore();
	const navigate = useNavigate();
	const { t } = useTranslation();

	async function onSubmit(data: { member: AppMembers[] }, setError: (error: APIError) => void) {
		const appMembers = data.member.filter((item) => item.email !== '' && item.role !== '');
		setDataPartially({
			appMembers,
		});
		setStepByPath('/onboarding/invite-team-members', {
			isDone: true,
		});
		const res = await finalizeClusterSetup({
			...onboardingReq,
			appMembers,
		});

		if ('error' in res) {
			setError(res);
			return;
		}
	}

	return (
		<InviteMemberForm
			title={t('onboarding.invite.title')}
			description={t('onboarding.invite.desc')}
			submitForm={onSubmit}
			roles={appRoles}
			actions={
				<div className='flex items-center justify-end gap-4'>
					<Button variant='text' size='lg' onClick={goBack}>
						{t('onboarding.previous')}
					</Button>
					<Button variant='primary' size='lg'>
						{t('onboarding.finish')}
					</Button>
				</div>
			}
		/>
	);
}

InviteTeamMembers.loader = loader;
