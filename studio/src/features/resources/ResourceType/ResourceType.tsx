import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible';
import { Instance } from '@/types';
import { cn } from '@/utils';
import { RadioGroupItem } from '@/components/RadioGroup';
import { Label } from '@/components/Label';
import useResourceStore from '@/store/resources/resourceStore';
import './resourceTypes.scss';
interface ResourceTypeProps {
	type: Instance;
	instances: Instance[];
	isDefault: boolean;
}

export default function ResourceType({ type, instances, isDefault }: ResourceTypeProps) {
	const { resourceType } = useResourceStore();
	return (
		<Collapsible className='border border-border data-[state="open"]:border-button-primary rounded p-4'>
			<CollapsibleTrigger className='flex items-center gap-4'>
				<div className='p-3 bg-lighter rounded-full'>
					<type.icon className='w-6 h-6 text-default' />
				</div>
				<span className='text-default  font-sfCompact'>{type.name}</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className={cn('type-group', isDefault ? 'isDefault' : 'isNotDefault')}>
					{instances?.map((instance) => (
						<div
							key={instance.id}
							className={cn(
								'type-item',
								resourceType.type === instance.name && resourceType.name === type.name && 'active',
							)}
						>
							<RadioGroupItem
								value={`${type.name}-${instance.name}`}
								id={`${type.name}-${instance.name}`}
								className='type-group-item'
							/>
							<Label htmlFor={`${type.name}-${instance.name}`} className='cursor-pointer'>
								<div className='type-label'>
									{isDefault ? (
										<div
											className={cn(
												'type-icon',
												resourceType.type === instance.name && resourceType.name === type.name
													? 'bg-elements-strong-blue'
													: 'bg-lighter',
											)}
										>
											<instance.icon className='icon' />
										</div>
									) : (
										<instance.icon className='w-10 h-10' />
									)}
									<div className='type-name'>{instance.name}</div>
								</div>
							</Label>
						</div>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
