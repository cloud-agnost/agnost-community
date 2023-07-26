import { Plus } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuItemContainer,
} from 'components/Dropdown';
import useTypeStore from '@/store/types/typeStore.ts';
import { toDisplayName } from '@/utils';
import { DatabaseType, FieldType } from '@/types';
import { EditOrCreateFieldDrawer } from '@/features/database/models/fields/ListFields';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useParams } from 'react-router-dom';

export default function CreateFieldButton() {
	const { t } = useTranslation();
	const databases = useDatabaseStore((state) => state.databases);
	const [open, setOpen] = useState(false);
	const [selectedType, setSelectedType] = useState<FieldType>();
	const fieldTypes = useTypeStore((state) => state.fieldTypes);
	const { dbId } = useParams();

	const databaseType = useMemo(() => {
		return databases.find((item) => item._id === dbId)?.type as keyof DatabaseType;
	}, [databases, dbId]);

	const types = useMemo(() => {
		return fieldTypes.filter(
			(item) => !['createdat', 'updatedat'].includes(item.name) && item[databaseType],
		);
	}, [databaseType, fieldTypes]);

	function onSelectedType(type: FieldType) {
		setSelectedType(type);
		setOpen(true);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className='gap-2 whitespace-nowrap'>
						<Plus weight='bold' />
						{t('database.fields.add')}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-[330px] max-h-[650px] overflow-y-auto'>
					<DropdownMenuItemContainer className='divide-y [&>*:not(:first-child)]:pt-3 [&>*:not(:last-child)]:pb-3'>
						<DropdownMenuGroup className='grid grid-cols-2 gap-0.5'>
							{types.map((item, index) => (
								<DropdownMenuItem onClick={() => onSelectedType(item)} key={index}>
									{toDisplayName(item.name)}
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>
			<EditOrCreateFieldDrawer
				type={selectedType}
				open={open}
				onOpenChange={() => setOpen(false)}
			/>
		</>
	);
}
