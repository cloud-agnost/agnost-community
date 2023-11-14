import { FIELD_ICON_MAP } from '@/constants';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import useTypeStore from '@/store/types/typeStore.ts';
import { DatabaseType, FieldType, Model } from '@/types';
import { toDisplayName } from '@/utils';
import { Plus } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import groupBy from 'utils/utils.ts';
import { CreateField } from '.';
export default function CreateFieldButton() {
	const { t } = useTranslation();
	const databases = useDatabaseStore((state) => state.databases);
	const [open, setOpen] = useState(false);
	const fieldTypes = useTypeStore((state) => state.fieldTypes);
	const { dbId, modelId } = useParams();
	const canCreateField = useAuthorizeVersion('model.create');
	const { models, selectedType, setSelectedType } = useModelStore();

	const databaseType = useMemo(() => {
		return databases.find((item) => item._id === dbId)?.type as keyof DatabaseType;
	}, [databases, dbId]);

	const model = useMemo(() => {
		return getModelById(modelId as string);
	}, [models, modelId]) as Model;

	function getModelById(_id: string) {
		if (_id.startsWith('mdl-')) return models.find((item) => item.iid === _id);
		return models.find((item) => item._id === _id);
	}

	const types = useMemo(() => {
		const types = fieldTypes.filter((item) => item.group !== 'none' && item[databaseType]);
		return groupBy(types, (item) => item.group);
	}, [databaseType, fieldTypes]);

	function onSelectedType(type: FieldType) {
		setSelectedType(type);
		setOpen(true);
	}

	function findTopModel(model: Model): Model {
		if (!model.parentiid) return model;

		const parentModel = getModelById(model.parentiid);
		if (!parentModel?.parentiid) return model;

		return findTopModel(parentModel);
	}

	const hideReferenceFields = useMemo(() => {
		const parent = findTopModel(model);
		return parent.type === 'sub-model-list';
	}, []);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild disabled={!canCreateField}>
					<Button className='gap-2 whitespace-nowrap' disabled={!canCreateField}>
						<Plus weight='bold' />
						{t('database.fields.add')}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-[330px] max-h-[650px] overflow-y-auto'>
					<DropdownMenuItemContainer>
						{Object.entries(types).map(([key, types], index) => (
							<Fragment key={key}>
								{index !== 0 && <DropdownMenuSeparator />}
								<DropdownMenuGroup className='grid grid-cols-2 gap-y-1 gap-1'>
									<DropdownMenuLabel className='py-[6px] col-span-2 text-subtle leading-6 text-sm font-medium'>
										{toDisplayName(key)}
									</DropdownMenuLabel>
									{types
										.filter((item) => (hideReferenceFields ? item.name !== 'reference' : true))
										.map((item) => {
											const Icon = FIELD_ICON_MAP[item.name];
											return (
												<DropdownMenuItem
													className='gap-2'
													onClick={() => onSelectedType(item)}
													key={item.name}
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
			<CreateField open={open} onOpenChange={setOpen} />
		</>
	);
}
