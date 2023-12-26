import { Carousel } from '@/components/Carousel';
import { Logo } from '@/components/Logo';
import { SLIDER_IMAGES } from '@/constants';
import { ReactNode } from 'react';
import './AuthLayout.scss';
import { cn } from '@/utils';

type AuthLayoutProps = {
	children: ReactNode;
	className?: string;
};

export default function AuthLayout({ children, className }: AuthLayoutProps) {
	return (
		<div className='auth-layout'>
			<div className='auth-layout-left'>
				<Logo className='auth-layout-app-logo' />
				<Carousel
					className='!m-0'
					showArrows={false}
					items={SLIDER_IMAGES.map(({ image, text }) => {
						return {
							element: <img src={image} alt={text} key={image} />,
							text,
						};
					})}
				/>
			</div>
			<div className={cn('auth-layout-right', className)}>{children}</div>
		</div>
	);
}
