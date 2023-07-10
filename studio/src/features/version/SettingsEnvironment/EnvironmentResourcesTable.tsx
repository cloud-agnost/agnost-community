import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/Table';
import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { Trash } from '@phosphor-icons/react';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import { useTranslation } from 'react-i18next';

export default function EnvironmentResourcesTable() {
	const resources = useEnvironmentStore((state) => state.resources);
	const { t } = useTranslation();
	return (
		<Table className='bg-inherit'>
			<TableHeader>
				<TableRow className='whitespace-nowrap'>
					<TableHead>{t('general.name').toUpperCase()}</TableHead>
					<TableHead>{t('general.type').toUpperCase()}</TableHead>
					<TableHead>{t('general.managed').toUpperCase()}</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{resources.map(({ _id, managed, type, name }) => (
					<TableRow key={_id} className='font-sfCompact font-normal'>
						<TableCell>{name}</TableCell>
						<TableCell>{type}</TableCell>
						<TableCell>
							<Badge
								variant={managed ? 'green' : 'red'}
								text={managed ? t('general.yes') : t('general.no')}
								rounded
							/>
						</TableCell>
						<TableCell className='text-right text-[24px]'>
							<div className='flex items-center gap-1 justify-center'>
								<Button variant='blank' className='hover:bg-subtle aspect-square' rounded iconOnly>
									<Pencil />
								</Button>
								<Button variant='blank' className='hover:bg-subtle aspect-square' rounded iconOnly>
									<Trash />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
