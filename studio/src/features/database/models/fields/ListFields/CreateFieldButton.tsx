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
import { DatabaseType, FieldType, Model } from '@/types';
import { EditOrCreateFieldDrawer } from '@/features/database/models/fields/ListFields';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useParams } from 'react-router-dom';
import groupBy from 'utils/utils.ts';
import { FIELD_ICON_MAP } from '@/constants';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useModelStore from '@/store/database/modelStore.ts';
export default function CreateFieldButton() {
	const { t } = useTranslation();
	const databases = useDatabaseStore((state) => state.databases);
	const [open, setOpen] = useState(false);
	const [selectedType, setSelectedType] = useState<FieldType>();
	const fieldTypes = useTypeStore((state) => state.fieldTypes);
	const { dbId, modelId } = useParams();
	const canCreateField = useAuthorizeVersion('model.create');
	const models = useModelStore((state) => state.models);

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
		if (!parentModel) return model;

		return findTopModel(parentModel);
	}

	const hideReferenceFields = useMemo(() => {
		const parent = findTopModel(model);
		return parent.fields.some((item) => item?.objectList?.iid === model.iid);
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
							<Fragment key={index}>
								{index !== 0 && <DropdownMenuSeparator />}
								<DropdownMenuGroup className='grid grid-cols-2 gap-y-1 gap-1'>
									<DropdownMenuLabel className='py-[6px] col-span-2 text-subtle leading-6 text-sm font-medium'>
										{toDisplayName(key)}
									</DropdownMenuLabel>
									{types
										.filter((item) => (hideReferenceFields ? item.name !== 'reference' : true))
										.map((item, index) => {
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
