import { ReactNode } from 'react';
interface SettingsFormItemProps {
	title: string;
	description?: string | null;
	children?: ReactNode;
}
export default function ProfileSettingsFormItem({
	title,
	description,
	children,
}: SettingsFormItemProps) {
	return (
		<div className='grid lg:grid-cols-2 gap-12 py-8'>
			<div>
				<div className='text-sm leading-6 text-default tracking-tight font-medium'>{title}</div>
				{description && (
					<p className='text-subtle text-sm tracking-tight font-normal'>{description}</p>
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}
