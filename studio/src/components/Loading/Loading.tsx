import { cn } from '@/utils';
import BeatLoader from 'react-spinners/BeatLoader';
import { LoaderSizeMarginProps } from 'react-spinners/helpers/props';

interface LoadingProps extends LoaderSizeMarginProps {
	className?: string;
}
export default function Loading({ className, ...props }: LoadingProps) {
	return (
		<div
			className={cn(
				'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10',
				className,
			)}
		>
			<BeatLoader color='#0f87ff' size={16} margin={12} {...props} />
		</div>
	);
}
