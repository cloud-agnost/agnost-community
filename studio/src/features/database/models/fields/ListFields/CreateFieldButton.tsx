import { Plus } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { Fragment, useMemo, useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from 'components/Dropdown';
import useTypeStore from '@/store/types/typeStore.ts';
import { toDisplayName } from '@/utils';
import { DatabaseType, FieldType } from '@/types';
import { EditOrCreateFieldDrawer } from '@/features/database/models/fields/ListFields';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useParams } from 'react-router-dom';
import groupBy from 'utils/utils.ts';
import { FIELD_ICON_MAP } from '@/constants';

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
		const types = fieldTypes.filter((item) => item.group !== 'none' /* && item[databaseType] */);
		return groupBy(types, (item) => item.group);
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
					<DropdownMenuItemContainer>
						{Object.entries(types).map(([key, types], index) => (
							<Fragment key={index}>
								{index !== 0 && <DropdownMenuSeparator />}
								<DropdownMenuGroup className='grid grid-cols-2 gap-y-1 gap-1'>
									<DropdownMenuLabel className='py-[6px] col-span-2 text-subtle leading-6 text-sm font-medium'>
										{toDisplayName(key)}
									</DropdownMenuLabel>
									{types.map((item, index) => {
										const Icon = FIELD_ICON_MAP[item.name];
										return (
											<DropdownMenuItem
												className='gap-2'
												onClick={() => onSelectedType(item)}
												key={index}
											>
												<Icon className='text-icon-base text-xl' />
												{toDisplayName(item.name)}
											</DropdownMenuItem>
										);
									})}
								</DropdownMenuGroup>
							</Fragment>
						))}
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>
			<EditOrCreateFieldDrawer
				key={open.toString()}
				type={selectedType}
				open={open}
				onOpenChange={() => setOpen(false)}
			/>
		</>
	);
}
