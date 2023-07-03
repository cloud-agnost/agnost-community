import useClusterStore from '@/store/cluster/clusterStore.ts';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { LoaderFunctionArgs, Outlet, redirect, useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/Stepper';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';

import './onboarding.scss';
import useAuthStore from '@/store/auth/authStore.ts';

async function loader(params: LoaderFunctionArgs) {
	const status = await useClusterStore.getState().checkClusterSetup();
	const { currentStepIndex, steps } = useOnboardingStore.getState();
	const isAuthenticated = useAuthStore.getState().isAuthenticated();

	if (status) {
		return redirect(isAuthenticated ? '/organization' : '/login');
	}

	const url = new URL(params.request.url);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const lastDoneStep = steps[currentStepIndex];

	if (lastDoneStep && lastDoneStep.path !== url.pathname) {
		return redirect(lastDoneStep.path);
	}

	return null;
}

export default function Onboarding() {
	const { steps, getPrevPath, goToPrevStep } = useOnboardingStore();
	const navigate = useNavigate();

	function goBack() {
		const prev = getPrevPath();
		if (prev) {
			goToPrevStep();
			navigate(prev);
		}
	}

	const stepper = <Stepper steps={steps} classname='w-full' />;

	return (
		<OnboardingLayout stepper={stepper}>
			<div className='onboarding-page'>
				<Outlet context={{ goBack }} />
			</div>
		</OnboardingLayout>
	);
}

Onboarding.loader = loader;
