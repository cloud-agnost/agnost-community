import { RadioGroup } from '@/components/RadioGroup';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/Accordion';
import { DEFAULT_RESOURCE_INSTANCES, RESOURCE_TYPES, STORAGE_TYPES } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { useTranslation } from 'react-i18next';
import CreateResourceLayout from './CreateResource/CreateResourceLayout';
import ResourceType from './ResourceType/ResourceType';
export default function SelectResourceType() {
	const { selectResourceType, resourceType } = useResourceStore();
	const { t } = useTranslation();
	const selectResource = (val: string) => {
		const [name, type] = val.split('-');
		selectResourceType(name, type);
	};
	return (
		<RadioGroup
			defaultValue={`${resourceType.name}-${resourceType.type}`}
			onValueChange={selectResource}
			className='h-full'
		>
			<CreateResourceLayout title={t('resources.select')} typeSelection>
				<div className='space-y-4'>
					<Accordion
						type='single'
						defaultValue={RESOURCE_TYPES[0].id}
						collapsible
						className='w-full space-y-8'
						onValueChange={() => {
							selectResourceType('', '');
						}}
					>
						{RESOURCE_TYPES.map((type) => (
							<AccordionItem key={type.name} value={type.id}>
								<AccordionTrigger className='border-x border-t border-border data-[state="open"]:border-button-primary rounded p-4'>
									<div className='p-3 bg-lighter rounded-full'>
										<type.icon className='w-6 h-6 text-default' />
									</div>
									<span className='text-default font-sfCompact'>{type.name}</span>
								</AccordionTrigger>
								<AccordionContent className='border-x border-b border-t-0 border-border data-[state="open"]:border-button-primary'>
									<ResourceType
										type={type}
										instances={
											type.name === t('version.storage')
												? STORAGE_TYPES
												: DEFAULT_RESOURCE_INSTANCES
										}
										isDefault={type.name !== t('version.storage')}
									/>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</CreateResourceLayout>
		</RadioGroup>
	);
}
