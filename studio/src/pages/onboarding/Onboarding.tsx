import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';
import { LoaderFunctionArgs, Outlet, redirect, useNavigate } from 'react-router-dom';
import './onboarding.scss';

async function loader(params: LoaderFunctionArgs) {
	const status = await useClusterStore.getState().checkClusterSetup();
	const { currentStepIndex, steps } = useOnboardingStore.getState();
	const isAuthenticated = useAuthStore.getState().isAuthenticated();

	if (status) {
		return redirect(isAuthenticated ? '/organization' : '/login');
	}

	const url = new URL(params.request.url);
	const lastDoneStep = steps[currentStepIndex];

	if (lastDoneStep && lastDoneStep.path !== url.pathname) {
		return redirect(lastDoneStep.path);
	}

	return null;
}

export default function Onboarding() {
	const { getPrevPath, goToPrevStep } = useOnboardingStore();
	const navigate = useNavigate();

	function goBack() {
		const prev = getPrevPath();
		if (prev) {
			goToPrevStep();
			navigate(prev);
		}
	}

	return (
		<OnboardingLayout>
			<div className='onboarding-page'>
				<Outlet context={{ goBack }} />
			</div>
		</OnboardingLayout>
	);
}

Onboarding.loader = loader;
