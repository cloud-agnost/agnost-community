import { Button } from '@/components/Button';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import useClusterStore from '@/store/cluster/clusterStore';
import useOnboardingStore from '@/store/onboarding/onboardingStore';
import useTypeStore from '@/store/types/typeStore';
import { APIError, AppMembers } from '@/types/type';
import { useNavigate, useOutletContext } from 'react-router-dom';
async function loader() {
	return null;
}

export default function InviteTeamMembers() {
	const { goBack } = useOutletContext() as { goBack: () => void };
	const { setStepByPath, setDataPartially, data: onboardingReq } = useOnboardingStore();
	const { finalizeClusterSetup } = useClusterStore();
	const { appRoles } = useTypeStore();
	const navigate = useNavigate();

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
		navigate('/organization');
	}

	return (
		<InviteMemberForm
			title='Invite Members To App Team'
			description='You can invite team members to your application with different role profiles. These team members will also become organization members and can be easily added as member to other organization apps.'
			submitForm={onSubmit}
			roles={appRoles}
			actions={
				<div className='flex items-center justify-end gap-4'>
					<Button variant='text' size='lg' onClick={goBack}>
						Previous
					</Button>
					<Button variant='primary' size='lg'>
						Finish
					</Button>
				</div>
			}
		/>
	);
}

InviteTeamMembers.loader = loader;
