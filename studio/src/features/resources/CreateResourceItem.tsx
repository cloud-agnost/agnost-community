import React from 'react';
import { Separator } from '@/components/Separator';
interface Props {
	title: string;
	children: React.ReactNode;
	lastItem?: boolean;
}
export default function CreateResourceItem({ title, children, lastItem }: Props) {
	return (
		<>
			<div className='space-y-4'>
				{title && <p className=' font-sfCompact text-sm text-subtle '>{title}</p>}
				{children}
			</div>
			{!lastItem && <Separator className='my-6' />}
		</>
	);
}
