import { ReactNode } from 'react';
import './AuthLayout.scss';
import { Logo } from '@/components/Logo';
import { Slider } from '@/components/Slider';

type AuthLayoutProps = {
	children: ReactNode;
};

const items = [
	{
		text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A architecto assumenda explicabo ipsa modi nesciunt nisi, nobis, provident quaerat qui quis, saepe sed sint soluta sunt voluptatem voluptatibus! Animi, officiis?',
		element: <img src='https://shaders-slider.uiinitiative.com/images/01.jpg' alt='' />,
	},
	{
		text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A architecto assumenda explicabo ipsa modi nesciunt nisi, nobis, provident quaerat qui quis, saepe sed sint soluta sunt voluptatem voluptatibus! Animi, officiis?',
		element: <img src='https://shaders-slider.uiinitiative.com/images/02.jpg' alt='' />,
	},
	{
		text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A architecto assumenda explicabo ipsa modi nesciunt nisi, nobis, provident quaerat qui quis, saepe sed sint soluta sunt voluptatem voluptatibus! Animi, officiis?',
		element: <img src='https://shaders-slider.uiinitiative.com/images/02.jpg' alt='' />,
	},
];

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className='auth-layout'>
			<div className='auth-layout-left'>
				<Logo className='auth-layout-app-logo' />
				<Slider items={items} />
			</div>
			<div className='auth-layout-right'>{children}</div>
		</div>
	);
}
