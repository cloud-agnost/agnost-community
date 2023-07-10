import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/Table';
import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { Trash } from '@phosphor-icons/react';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';

export default function EnvironmentResourcesTable() {
	const environment = useEnvironmentStore((state) => state.environment);
	return (
		<Table className='bg-inherit'>
			<TableHeader>
				<TableRow className='whitespace-nowrap'>
					<TableHead>NAME</TableHead>
					<TableHead>TYPE</TableHead>
					<TableHead>MANAGED</TableHead>
					<TableHead />
				</TableRow>
			</TableHeader>
			<TableBody>
				{environment?.mappings.map(({ _id, resource }) => (
					<TableRow key={_id} className='font-sfCompact font-normal'>
						<TableCell>{resource.name}</TableCell>
						<TableCell>{resource.type}</TableCell>
						<TableCell>
							<Badge text={resource.name} rounded />
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
