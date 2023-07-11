import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Separator } from '@/components/Separator';
import { Slider } from '@/components/Slider';
import { DATABASE_TYPES, MIN_DB_SIZE, MAX_DB_SIZE } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResourceInstance from '../../ResourceType/ResourceInstance';
import CreateResourceLayout from '../CreateResourceLayout';

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
					<p className=' font-sfCompact text-sm text-default'>
						{t('general.gb', {
							size: MIN_DB_SIZE,
						})}
					</p>
					<p className=' font-sfCompact text-sm text-default'>
						{t('general.gb', {
							size: MAX_DB_SIZE,
						})}
					</p>
				</div>
				<Slider
					defaultValue={[storageSize]}
					max={MAX_DB_SIZE}
					min={MIN_DB_SIZE}
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
