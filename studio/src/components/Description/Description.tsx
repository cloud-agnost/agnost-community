import { ReactNode } from 'react';
import { cn } from '@/utils';

import './Description.scss';

type Props = {
	className?: string;
	children?: ReactNode;
	title?: string;
};

export default function Description({ children, title, className }: Props) {
	return (
		<div className={cn('description', className)}>
			{title && <h2 className='description-title'>{title}</h2>}
			<p className='description-content'>{children}</p>
		</div>
	);
}
