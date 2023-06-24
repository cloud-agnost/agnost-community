import { ReactNode } from 'react';
interface SettingsFormItemProps {
	title: string;
	description?: string | null;
	children?: ReactNode;
}
export default function SettingsFormItem({ title, description, children }: SettingsFormItemProps) {
	return (
		<div className='space-y-6 py-8 max-w-2xl'>
			<div className='text-sm leading-6 text-default tracking-tight font-medium'>{title}</div>
			{description && (
				<p className='text-subtle text-sm tracking-tight font-normal'>{description}</p>
			)}
			{children}
		</div>
	);
}
