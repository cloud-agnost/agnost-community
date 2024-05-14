import { Description } from '@/components/Description';
import React from 'react';

interface DescriptionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

export default function ContainerFormTitle({ children, title, description }: DescriptionProps) {
	return (
		<div className='flex items-center gap-4'>
			<div className='border border-white rounded-full p-1 self-start'>{children}</div>
			<Description
				title={title}
				className='[&>h2]:leading-none [&>p]:leading-5 space-y-4 text-pretty'
			>
				{description}
			</Description>
		</div>
	);
}
