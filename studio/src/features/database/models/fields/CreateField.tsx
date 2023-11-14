import { Form } from '@/components/Form';
import { useFieldSchema } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import { DatabaseTypes, FieldType, FieldTypes, ReferenceAction } from '@/types';
import { toDisplayName } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import FieldForm from './FieldForm';
import { useEffect } from 'react';
export default function CreateField({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { Schema, typeCheck } = useFieldSchema();
	const database = useDatabaseStore((state) => state.database);
	const { isBoolean, isReference, isDecimal, isInteger } = typeCheck;
	const { t } = useTranslation();
	const { addNewField, selectedType } = useModelStore();
	const { dbId, modelId, appId, versionId, orgId } = useParams() as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};
	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			type: selectedType?.name as FieldTypes,
			immutable: false,
			indexed: false,
			required: false,
			searchable: false,
			unique: false,
			timeStamps: {
				enabled: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
			},
		},
	});

	async function onSubmit(data: z.infer<typeof Schema>) {
		const getDefaultValue = () => {
			if ((isReference && database.type !== DatabaseTypes.MongoDB) || isDecimal || isInteger) {
				return Number(data.defaultValue);
			}
			if (isBoolean) return data.defaultValue ? JSON.parse(data.defaultValue) : undefined;
			return data.defaultValue;
		};
		addNewField({
			orgId,
			appId,
			versionId,
			dbId,
			modelId,
			...data,
			text: {
				searchable: data.searchable,
				maxLength: Number(data.maxLength),
				language: data.language,
			},
			richText: {
				searchable: data.searchable,
				language: data.language,
			},
			encryptedText: {
				maxLength: Number(data.maxLength),
			},
			decimal: {
				decimalDigits: Number(data.decimalDigits),
			},
			reference: {
				iid: data.referenceModelIid as string,
				action: data.referenceAction as ReferenceAction,
			},
			enum: {
				selectList: data.enumSelectList?.trim().split('\n') as string[],
			},
			object: {
				timestamps: data.timeStamps,
			},
			objectList: {
				timestamps: data.timeStamps,
			},
			defaultValue: getDefaultValue(),
		});
	}
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader>
					<DrawerTitle>
						{t('database.fields.add_field', {
							field: toDisplayName(selectedType.name),
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 space-y-6'>
						<FieldForm />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
