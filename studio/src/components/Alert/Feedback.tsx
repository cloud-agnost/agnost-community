import { Error, SuccessCheck } from '@/components/icons';

interface Props {
	success: boolean;
	title: string;
	description: string;
}
export default function Feedback({ success, title, description }: Props) {
	const Icon = success ? SuccessCheck : Error;
	return (
		<div className='flex flex-col items-center p-8 space-y-4 text-center'>
			<Icon className='h-24 w-24' />
			<h2 className='text-3xl font-semibold text-default'>{title}</h2>
			<p className='text-subtle'>{description}</p>
		</div>
	);
}
