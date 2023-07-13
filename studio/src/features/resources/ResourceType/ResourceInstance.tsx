import { Button } from '@/components/Button';
import { Instance } from '@/types';
import { cn } from '@/utils';
interface ResourceInstanceProps {
	instance: Instance;
	active: boolean;
	onSelect: (instance: Instance) => void;
}
export default function ResourceInstance({ instance, active, onSelect }: ResourceInstanceProps) {
	return (
		<Button
			type='button'
			variant='blank'
			key={instance.id}
			className={cn('h-24 p-4 gap-2 border border-border', active && 'border-button-primary')}
			onClick={() => onSelect(instance)}
		>
			<div className='flex flex-col items-center justify-center gap-2'>
				<instance.icon className='w-10 h-10 text-default' />
				<span className='text-default font-sfCompact text-sm'>{instance.name}</span>
			</div>
		</Button>
	);
}
