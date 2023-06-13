import useClusterStore from '@/store/cluster/clusterStore.ts';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { LoaderFunctionArgs, Outlet, redirect, useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/Stepper';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';

import './onboarding.scss';
import { data } from 'autoprefixer';

async function loader(params: LoaderFunctionArgs) {
	const status = await useClusterStore.getState().checkClusterSetup();
	const { currentStepIndex, steps } = useOnboardingStore.getState();

	// TODO: check later
	if (status) {
		// return redirect('/organization');
	}

	const url = new URL(params.request.url);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const lastDoneStep = steps[currentStepIndex];

	if (lastDoneStep && lastDoneStep.path !== url.pathname) {
		return redirect(lastDoneStep.path);
	}

	return data;
}

export default function Onboarding() {
	const { steps, getPrevPath, goToPrevStep } = useOnboardingStore();
	// const location = useLocation();
	const navigate = useNavigate();

	/*
	useEffect(() => {
		useOnboardingStore.setState((prev) => {
			const steps = prev.steps.map((step) => {
				step.isActive = removeLastSlash(step.path) === removeLastSlash(location.pathname);
				return step;
			});

			return {
				steps,
			};
		});
	}, [location]);

	 */

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
