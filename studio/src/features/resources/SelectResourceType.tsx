import { Button } from '@/components/Button';
import { RadioGroup } from '@/components/RadioGroup';
import { DEFAULT_RESOURCE_INSTANCES, RESOURCE_TYPES, STORAGE_TYPES } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { useTranslation } from 'react-i18next';
import CreateResourceLayout from './CreateResource/CreateResourceLayout';
import ResourceType from './ResourceType/ResourceType';
export default function SelectResourceType() {
	const { selectResourceType, goToNextStep, resourceType } = useResourceStore();
	const { t } = useTranslation();
	const selectResource = (val: string) => {
		console.log(val);
		const [name, type] = val.split('-');
		selectResourceType(name, type);
	};
	return (
		<RadioGroup
			defaultValue={`${resourceType.name}-${resourceType.type}`}
			onValueChange={selectResource}
			className='h-full'
		>
			<CreateResourceLayout
				title={t('resources.select')}
				actions={
					<Button
						variant='primary'
						size='lg'
						onClick={goToNextStep}
						disabled={resourceType.type && resourceType.name ? false : true}
					>
						{t('general.next')}
					</Button>
				}
				typeSelection
			>
				<div className='space-y-4'>
					{RESOURCE_TYPES.map((type) => (
						<ResourceType
							key={type.id}
							type={type}
							instances={
								type.name === t('version.storage') ? STORAGE_TYPES : DEFAULT_RESOURCE_INSTANCES
							}
							isDefault={type.name !== t('version.storage')}
						/>
					))}
				</div>
			</CreateResourceLayout>
		</RadioGroup>
	);
}
