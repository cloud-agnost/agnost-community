import { createBrowserRouter } from 'react-router-dom';
import { Slider } from '@/components/Slider';
import { AuthLayout } from '@/layouts/AuthLayout';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';

const items = [
	{
		text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A architecto assumenda explicabo ipsa modi nesciunt nisi, nobis, provident quaerat qui quis, saepe sed sint soluta sunt voluptatem voluptatibus! Animi, officiis?',
		element: <img src='https://shaders-slider.uiinitiative.com/images/01.jpg' alt='' />,
	},
	{
		text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A architecto assumenda explicabo ipsa modi nesciunt nisi, nobis, provident quaerat qui quis, saepe sed sint soluta sunt voluptatem voluptatibus! Animi, officiis?',
		element: <img src='https://shaders-slider.uiinitiative.com/images/02.jpg' alt='' />,
	},
];

const router = createBrowserRouter([
	{
		path: '/',
		element: <div className=' font-bold text-element-strong-blue text-3xl'>Hello Agnost</div>,
	},
	{
		path: '/slider',
		element: (
			<div className='flex p-10 items-center justify-center'>
				<Slider items={items} />
			</div>
		),
	},
	{
		path: '/login',
		element: <AuthLayout>Özgür ÖZALP</AuthLayout>,
	},
	{
		path: '/onboarding',
		element: <OnboardingLayout>Özgür ÖZALP</OnboardingLayout>,
	},
]);

export default router;
