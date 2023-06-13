import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { OnboardingData } from '@/types/type.ts';
import { removeLastSlash } from '@/utils/utils.ts';

export interface Step {
	text: string;
	path: string;
	isDone: boolean;
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

						nextPath: '/onboarding/create-organization',
					},
					{
						text: 'Create Your Organization',
						path: '/onboarding/create-organization',
						isDone: false,

						prevPath: '/onboarding',
						nextPath: '/onboarding/create-app',
					},
					{
						text: 'Create Your First App',
						path: '/onboarding/create-app',
						isDone: false,

						prevPath: '/onboarding/create-organization',
						nextPath: '/onboarding/smtp-configuration',
					},
					{
						text: 'Configure SMTP Server',
						path: '/onboarding/smtp-configuration',
						isDone: false,

						prevPath: '/onboarding/create-app',
						nextPath: '/onboarding/invite-team-members',
					},
					{
						text: 'Invite Team Members',
						path: '/onboarding/invite-team-members',
						isDone: false,

						prevPath: '/onboarding/smtp-configuration',
					},
				],
				data: {
					orgName: '',
					appName: '',
					uiBaseURL: window.location.origin,
					smtp: {
						host: 'smtp.mandrillapp.com',
						port: '587',
						useTLS: false,
						user: 'Altogic',
						password: 'iS-pNHmBJIXIpjOUXgYmZQ',
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
			}),
			{
				name: 'onboarding-storage',
			},
		),
		{
			name: 'onboarding',
		},
	),
);

export default useOnboardingStore;
