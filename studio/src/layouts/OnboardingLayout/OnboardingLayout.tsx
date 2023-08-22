import { AgnostOnlyLogo } from '@/components/icons';
import { ReactNode } from 'react';
import './OnboardingLayout.scss';

type OnboardingLayoutProps = {
	children: ReactNode;
	stepper: ReactNode;
};

export default function OnboardingLayout({ children, stepper }: OnboardingLayoutProps) {
	return (
		<div className='onboarding-layout'>
			<div className='onboarding-layout-left'>
				<AgnostOnlyLogo className='onboarding-layout-app-logo' />
				{stepper}
			</div>
			<div className='onboarding-layout-right'>{children}</div>
		</div>
	);
}
