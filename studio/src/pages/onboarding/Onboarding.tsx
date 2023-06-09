import useClusterStore from '@/store/cluster/clusterStore.ts';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { LoaderFunctionArgs, Outlet, redirect, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Stepper } from '@/components/Stepper';
import useOnboardingStore, { Step } from '@/store/onboarding/onboardingStore.ts';
import { removeLastSlash } from '@/utils/utils.ts';

async function loader(params: LoaderFunctionArgs) {
	const url = new URL(params.request.url);
	const steps = useOnboardingStore.getState().steps;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const lastDoneStep = steps.findLastIndex((step: Step) => step.isDone);

	if (lastDoneStep > -1 && steps[lastDoneStep + 1]) {
		const nextStep = steps[lastDoneStep + 1];

		if (nextStep.path !== url.pathname) {
			return redirect(nextStep.path);
		}
	}

	const status = await useClusterStore.getState().checkClusterSetup();
	if (status) {
		console.log(status);
		// TODO: Check if user is logged in
	}
	return null;
}

export default function Onboarding() {
	const { steps, getPrevPath } = useOnboardingStore();
	const location = useLocation();
	const navigate = useNavigate();

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

	function goBack() {
		const prev = getPrevPath();
		if (prev) navigate(prev);
	}

	const stepper = <Stepper steps={steps} classname='w-full' />;

	return (
		<OnboardingLayout stepper={stepper}>
			<div className='space-y-8 w-3/4 max-w-2xl mx-auto'>
				<Outlet context={{ goBack }} />
			</div>
		</OnboardingLayout>
	);
}

Onboarding.loader = loader;
