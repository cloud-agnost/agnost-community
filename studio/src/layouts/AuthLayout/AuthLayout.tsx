import { ReactNode } from 'react';
import './AuthLayout.scss';
import { Logo } from '@/components/Logo';
import { Slider } from '@/components/Slider';
import { SLIDER_IMAGES } from '@/constants';

type AuthLayoutProps = {
	children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className='auth-layout'>
			<div className='auth-layout-left'>
				<Logo className='auth-layout-app-logo' />
				<Slider className='!m-0' items={SLIDER_IMAGES} />
			</div>
			<div className='auth-layout-right'>{children}</div>
		</div>
	);
}
