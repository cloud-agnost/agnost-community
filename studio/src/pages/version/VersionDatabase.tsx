import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/Table';
import { Badge } from 'components/Badge';
import { BADGE_COLOR_MAP } from 'constants/constants.ts';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { Trash } from '@phosphor-icons/react';
import { SearchInput } from 'components/SearchInput';

const data = [
	{
		id: 'db_M4HfddltthXt',
		name: 'HR Database',
		type: 'PostgreSQL',
		managed: 'Yes',
		modelsCount: 10,
	},
	{
		id: 'db_M4HfddltthXt',
		name: 'HR Database',
		type: 'PostgreSQL',
		managed: 'No',
		modelsCount: 10,
	},
];

export default function VersionDatabase() {
	return (
		<div className='py-6 space-y-6'>
			<div className='flex justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>Databases</h1>
				<div className='flex items-center gap-6'>
					<SearchInput className='w-[450px]' placeholder='Search' />
					<Button>Create Database</Button>
				</div>
			</div>
			<Table className='bg-inherit'>
				<TableHeader>
					<TableRow className='whitespace-nowrap'>
						<TableHead>NAME</TableHead>
						<TableHead className='w-[23ch]'>ID</TableHead>
						<TableHead>TYPE</TableHead>
						<TableHead>MANAGED</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map(({ id, managed, name, type }) => (
						<TableRow key={id} className='font-sfCompact font-normal'>
							<TableCell>{name}</TableCell>
							<TableCell copyable copyableText={id}>
								<span className='truncate max-w-[15ch]'>{id}</span>
							</TableCell>
							<TableCell>{type}</TableCell>
							<TableCell>
								<Badge text={managed} variant={BADGE_COLOR_MAP[managed]} rounded />
							</TableCell>
							<TableCell className='text-right text-[24px]'>
								<div className='flex items-center gap-1 justify-center'>
									<Button
										variant='blank'
										className='hover:bg-subtle aspect-square'
										rounded
										iconOnly
									>
										<Pencil />
									</Button>
									<Button
										variant='blank'
										className='hover:bg-subtle aspect-square'
										rounded
										iconOnly
									>
										<Trash />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
