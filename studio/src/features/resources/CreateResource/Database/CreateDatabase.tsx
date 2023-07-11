import { DATABASE_TYPES } from '@/constants';
import { useTranslation } from 'react-i18next';
import CreateResourceLayout from '../CreateResourceLayout';
import { Button } from '@/components/Button';
import useResourceStore from '@/store/resources/resourceStore';
import { Separator } from '@/components/Separator';
import { Slider } from '@/components/Slider';
import { useState } from 'react';
import { Input } from '@/components/Input';
import { cn } from '@/utils';
import ResourceInstance from '../../ResourceType/ResourceInstance';
export default function CreateDatabase() {
	const { returnToPreviousStep } = useResourceStore();
	const [storageSize, setStorageSize] = useState(25);
	const [databaseType, setDatabaseType] = useState('');
	const { t } = useTranslation();
	return (
		<CreateResourceLayout
			title={t('resources.database.create')}
			actions={
				<div className='space-x-4'>
					<Button variant='secondary' size='lg' onClick={returnToPreviousStep}>
						{t('general.previous')}
					</Button>
					<Button variant='primary' size='lg'>
						{t('general.add')}
					</Button>
				</div>
			}
		>
			<div className='space-y-3'>
				<p className=' font-sfCompact text-sm text-subtle'>{t('resources.database.choose_type')}</p>
				<div className='grid grid-cols-4 gap-4'>
					{DATABASE_TYPES.map((type) => (
						<ResourceInstance
							key={type.id}
							instance={type}
							onSelect={() => setDatabaseType(type.name)}
							active={databaseType === type.name}
						/>
					))}
				</div>
			</div>
			<Separator className='my-8' />
			<div className='space-y-4'>
				<p className=' font-sfCompact text-sm text-subtle '>
					{t('resources.database.storage_size', {
						size: storageSize,
					})}
				</p>
				<div className='flex items-center justify-between'>
					<p className=' font-sfCompact text-sm text-default'>1 GB</p>
					<p className=' font-sfCompact text-sm text-default'>50 GB</p>
				</div>
				<Slider
					defaultValue={[storageSize]}
					max={50}
					step={1}
					onValueChange={(val) => setStorageSize(val[0])}
				/>
			</div>
			<Separator className='my-8' />
			<div className='space-y-4'>
				<p className=' font-sfCompact text-sm text-default '>
					{t('resources.database.read_replicas')}
				</p>
				<Input className='w-1/2 bg-transparent' />
			</div>
		</CreateResourceLayout>
	);
}
