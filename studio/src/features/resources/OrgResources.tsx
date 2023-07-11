import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { useTranslation } from 'react-i18next';
import { Plus } from '@phosphor-icons/react';
import useResourcesStore from '@/store/resources/resourceStore';
import useApplicationStore from '@/store/app/applicationStore';
import { useEffect } from 'react';
import { CreateResource, ResourceTable } from '@/features/resources';
export default function OrgResources() {
	const { t } = useTranslation();
	const { application } = useApplicationStore();
	const { resources, getResources, toggleCreateResourceModal } = useResourcesStore();

	useEffect(() => {
		getResources({
			appId: application?._id as string,
			page: 0,
			size: 10,
		});
	}, []);
	return (
		<div className='p-8'>
			<div className='flex items-center justify-between'>
				<h1 className='text-default text-2xl font-semibold text-center'>{t('resources.title')}</h1>
				<div className='flex items-center justify-center gap-6'>
					<SearchInput />
					<Button variant='primary' onClick={toggleCreateResourceModal}>
						<Plus size={16} />
						<span className='ml-2'>{t('resources.add')}</span>
					</Button>
				</div>
			</div>

			<div className='mt-8'>
				<ResourceTable resources={resources} />
			</div>
			<CreateResource />
		</div>
	);
}
