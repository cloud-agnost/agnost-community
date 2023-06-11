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
	data: OnboardingData;
	setStepByPath: (path: string, step: Partial<Step>) => void;
	setDataPartially: (data: Partial<OnboardingStore['data']>) => void;
	getPrevPath: () => string | undefined;
}

const useOnboardingStore = create<OnboardingStore>()(
	devtools(
		persist(
			(set, get) => ({
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
			}),
			{
				name: 'onboarding-storage',
			},
		),
	),
);

export default useOnboardingStore;
