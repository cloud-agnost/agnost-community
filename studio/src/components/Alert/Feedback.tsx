import { Error, SuccessCheck } from '@/components/icons';
import { cn } from '@/utils';
interface Props {
	success?: boolean;
	title: string;
	description: string;
	className?: string;
}
export default function Feedback({ success, title, description, className }: Props) {
	const Icon = success ? SuccessCheck : Error;
	return (
		<div className={cn('flex flex-col items-center p-8 space-y-4 text-center', className)}>
			<Icon className='h-24 w-24' />
			<h2 className='text-2xl font-semibold text-default'>{title}</h2>
			<p className='text-subtle'>{description}</p>
		</div>
	);
}
