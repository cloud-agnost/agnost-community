import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@/components/Select';
import { FormControl } from '../Form';
import { Resource } from '@/types';
import { RESOURCE_ICON_MAP } from '@/constants';
import { useTranslation } from 'react-i18next';
import { SelectProps } from '@radix-ui/react-select';
import { Button } from '../Button';
import { Plus } from '@phosphor-icons/react';
import useResourceStore from '@/store/resources/resourceStore';
interface ResourceSelectProps extends SelectProps {
	resources: Resource[];
	error: boolean;
}
export default function ResourceSelect({ resources, error, ...props }: ResourceSelectProps) {
	const { t } = useTranslation();
	const { toggleCreateResourceModal } = useResourceStore();
	function getIcon(type: string): React.ReactNode {
		const Icon = RESOURCE_ICON_MAP[type];
		return <Icon className='w-6 h-6' />;
	}

	return (
		<FormControl>
			<Select {...props}>
				<FormControl>
					<SelectTrigger error={error} className='w-1/3'>
						<SelectValue
							placeholder={`${t('general.select')} ${t('queue.create.resource.title')}`}
						/>
					</SelectTrigger>
				</FormControl>
				<SelectContent align='center'>
					<Button
						size='full'
						onClick={toggleCreateResourceModal}
						variant='blank'
						className='gap-2 px-3 !no-underline text-button-primary font-normal text-left justify-start hover:bg-subtle'
					>
						<Plus weight='bold' size={16} />
						{t('resources.add')}
					</Button>
					{resources.length > 0 && <SelectSeparator />}
					{resources.map((resource) => (
						<SelectItem key={resource._id} value={resource._id}>
							<div className='flex items-center gap-2'>
								{getIcon(resource.instance)}
								{resource.name}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FormControl>
	);
}
