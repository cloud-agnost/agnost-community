import { ReactNode } from 'react';
import './AuthLayout.scss';
import { Logo } from '@/components/Logo';
import { Carousel } from '@/components/Carousel';
import { SLIDER_IMAGES } from '@/constants';
import { GuestOnly } from '@/router';

type AuthLayoutProps = {
	children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className='auth-layout'>
			<div className='auth-layout-left'>
				<Logo className='auth-layout-app-logo' />
				<Carousel
					className='!m-0'
					pagination
					autoplay
					loop
					spaceBetween={10}
					items={SLIDER_IMAGES.map(({ image, text }) => {
						return {
							element: <img src={image} alt={text} key={image} />,
							text,
						};
					})}
				/>
			</div>
			<div className='auth-layout-right'>
				<GuestOnly>{children}</GuestOnly>
			</div>
		</div>
	);
}
