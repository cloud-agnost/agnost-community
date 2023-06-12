import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { OnboardingData } from '@/types/type.ts';
import { removeLastSlash } from '@/utils/utils.ts';

export interface Step {
	text: string;
	path: string;
	isDone: boolean;
	isActive: boolean;
	prevPath?: string;
	nextPath?: string;
}

interface OnboardingStore {
	steps: Step[];
	currentStepIndex: number;
	data: OnboardingData;
	setStepByPath: (path: string, step: Partial<Step>) => void;
	setStepByIndex: (index: number, step: Partial<Step>) => void;
	setDataPartially: (data: Partial<OnboardingStore['data']>) => void;
	getPrevPath: () => string | undefined;
	setCurrentStepIndex: (index: number) => void;
	set: (fn: (state: OnboardingStore) => OnboardingStore) => void;
	getCurrentStep: () => Step;
	goToNextStep: (isDone: boolean) => void;
	goToPrevStep: () => void;
}

const useOnboardingStore = create<OnboardingStore>()(
	devtools(
		persist(
			(set, get) => ({
				currentStepIndex: 0,
				steps: [
					{
						text: 'Account Information',
						path: '/onboarding',
						isDone: false,
						isActive: false,
						nextPath: '/onboarding/create-organization',
					},
					{
						text: 'Create Your Organization',
						path: '/onboarding/create-organization',
						isDone: false,
						isActive: false,
						prevPath: '/onboarding',
						nextPath: '/onboarding/create-app',
					},
					{
						text: 'Create Your First App',
						path: '/onboarding/create-app',
						isDone: false,
						isActive: false,
						prevPath: '/onboarding/create-organization',
						nextPath: '/onboarding/smtp-configuration',
					},
					{
						text: 'Configure SMTP Server',
						path: '/onboarding/smtp-configuration',
						isDone: false,
						isActive: false,
						prevPath: '/onboarding/create-app',
						nextPath: '/onboarding/invite-team-members',
					},
					{
						text: 'Invite Team Members',
						path: '/onboarding/invite-team-members',
						isDone: false,
						isActive: false,
						prevPath: '/onboarding/smtp-configuration',
					},
				],
				data: {
					orgName: '',
					appName: '',
					uiBaseURL: window.location.origin,
					smtp: {
						host: '',
						port: 587,
						useTLS: false,
						user: '',
						password: '',
					},
					appMembers: [],
				},
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
					const currentStepIndex = get().steps.findIndex((step) => step.isActive);
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
					set((state) => {
						get().setStepByIndex(state.currentStepIndex, { isActive: false, isDone });
						return {
							currentStepIndex: state.currentStepIndex + 1,
						};
					});
				},
				goToPrevStep() {
					set((state) => {
						get().setStepByIndex(state.currentStepIndex, { isActive: false });
						return {
							currentStepIndex: state.currentStepIndex - 1,
						};
					});
				},
				getCurrentStep() {
					return get().steps[get().currentStepIndex];
				},
				set: set,
			}),
			{
				name: 'onboarding-storage',
			},
		),
	),
);

export default useOnboardingStore;
