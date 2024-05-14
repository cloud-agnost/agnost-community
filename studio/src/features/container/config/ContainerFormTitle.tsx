import { Description } from '@/components/Description';
import React from 'react';

interface DescriptionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

export default function ContainerFormTitle({ children, title, description }: DescriptionProps) {
	return (
		<div className='flex items-center gap-2'>
			<div className='border border-white rounded-full p-0.5 self-start'>{children}</div>
			<Description title={title} className='[&>*]:leading-none space-y-4'>
				{description}
			</Description>
		</div>
	);
}
