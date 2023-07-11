import { DrawerFooter } from '@/components/Drawer';
import useResourceStore from '@/store/resources/resourceStore';
import { useTranslation } from 'react-i18next';

interface Props {
	title: string;
	children: React.ReactNode;
	actions: React.ReactNode;
}
export default function CreateResourceLayout({ title, children, actions }: Props) {
	const { t } = useTranslation();
	const { resourceType } = useResourceStore();

	return (
		<div className='px-6 py-4 space-y-6 max-h-[90%] overflow-auto'>
			<div className='font-sfCompact'>
				<p className='text-subtle text-sm'>
					{t('resources.step', {
						currentStep: resourceType.step,
					})}
				</p>
				<p className='text-default'>{title}</p>
			</div>
			{children}
			<DrawerFooter>{actions}</DrawerFooter>
		</div>
	);
}
