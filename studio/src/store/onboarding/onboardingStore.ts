import { create } from '@/helpers';
import { Step } from '@/types';
import { OnboardingData } from '@/types/type.ts';
import { removeLastSlash, translate } from '@/utils/utils.ts';
import { devtools, persist } from 'zustand/middleware';
interface OnboardingStore {
	steps: Step[];
	currentStepIndex: number;
	data: OnboardingData;
}

type Actions = {
	setStepByPath: (path: string, step: Partial<Step>) => void;
	setStepByIndex: (index: number, step: Partial<Step>) => void;
	setDataPartially: (data: Partial<OnboardingStore['data']>) => void;
	getPrevPath: () => string | undefined;
	setCurrentStepIndex: (index: number) => void;
	set: (fn: (state: OnboardingStore) => OnboardingStore) => void;
	getCurrentStep: () => Step;
	goToNextStep: (isDone: boolean) => void;
	goToPrevStep: () => void;
	reset: () => void;
};
const initialState: OnboardingStore = {
	currentStepIndex: 0,
	steps: [
		{
			text: translate('onboarding.account_info'),
			path: '/onboarding',
			isDone: false,
			nextPath: '/onboarding/create-organization',
		},
		{
			text: translate('onboarding.org.title'),
			path: '/onboarding/create-organization',
			isDone: false,
			prevPath: '/onboarding',
			nextPath: '/onboarding/create-app',
		},
		{
			text: translate('onboarding.app.title'),
			path: '/onboarding/create-app',
			isDone: false,
			prevPath: '/onboarding/create-organization',
			nextPath: '/onboarding/smtp-configuration',
		},
		{
			text: translate('onboarding.smtp.title'),
			path: '/onboarding/smtp-configuration',
			isDone: false,
			prevPath: '/onboarding/create-app',
			nextPath: '/onboarding/invite-team-members',
		},
		{
			text: translate('onboarding.invite.stepper_title'),
			path: '/onboarding/invite-team-members',
			isDone: false,
			prevPath: '/onboarding/smtp-configuration',
		},
	],
	data: {} as OnboardingData,
};
const useOnboardingStore = create<OnboardingStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				setDataPartially: (data) => {
					set((state) => ({
						data: {
							...state.data,
							...data,
						},
					}));
				},
				setStepByPath(path, stepToSet) {
					set((state) => ({
						steps: state.steps.map((step) =>
							removeLastSlash(step.path) === removeLastSlash(path)
								? { ...step, ...stepToSet }
								: step,
						),
					}));
				},
				getPrevPath() {
					const currentStepIndex = get().currentStepIndex;
					const prevStep = get().steps[currentStepIndex - 1];
					return prevStep?.path;
				},
				setCurrentStepIndex(index) {
					set({ currentStepIndex: index });
				},
				setStepByIndex(index, stepToSet) {
					set((state) => ({
						steps: state.steps.map((step, i) => (i === index ? { ...step, ...stepToSet } : step)),
					}));
				},
				goToNextStep(isDone = true) {
					if (get().currentStepIndex >= get().steps.length - 1) return;
					set((state) => {
						get().setStepByIndex(state.currentStepIndex, { isDone });
						return {
							currentStepIndex: state.currentStepIndex + 1,
						};
					});
				},
				goToPrevStep() {
					if (get().currentStepIndex <= 0) return;
					set((state) => {
						get().setStepByIndex(state.currentStepIndex - 1, { isDone: false });
						return {
							currentStepIndex: state.currentStepIndex - 1,
						};
					});
				},
				getCurrentStep() {
					return get().steps[get().currentStepIndex];
				},
				set: set,
				reset: () => set(initialState),
			}),
			{
				name: 'onboarding-storage',
			},
		),
	),
);

export default useOnboardingStore;
