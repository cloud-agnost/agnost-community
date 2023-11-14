import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useFieldSchema } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import { DatabaseTypes } from '@/types';
import { toDisplayName } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import FieldForm from './FieldForm';

export default function EditField({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { updateField, field } = useModelStore();
	const { Schema, typeCheck, defaults } = useFieldSchema();
	const { t } = useTranslation();

	const { database } = useDatabaseStore();
	const { dbId, modelId, appId, versionId, orgId } = useParams() as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};
	const { isDatetime, isDate, isBoolean, hasDefaultValue, isReference, isDecimal, isInteger } =
		typeCheck;

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
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
			defaultValue: isBoolean || isDatetime || isDate ? defaults[0].value : undefined,
			referenceModelIid: field?.reference?.iid,
		},
	});
	useEffect(() => {
		if (field && open) {
			form.reset({
				name: field.name,
				required: field.required,
				unique: field.unique,
				immutable: field.immutable,
				indexed: field.indexed,
				type: field.type,
				description: field.description,
				...(field.defaultValue && {
					defaultValue: field.defaultValue,
				}),
				...(field.text && {
					searchable: field.text.searchable,
					maxLength: field.text.maxLength.toString(),
					language: field.text.language,
				}),
				...(field.richText && {
					searchable: field.richText.searchable,
					language: field.richText.language,
				}),
				...(field.encryptedText && {
					maxLength: field.encryptedText.maxLength.toString(),
				}),
				...(field.decimal && {
					decimalDigits: field.decimal.decimalDigits,
				}),
				...(field.enum && {
					enumSelectList: field.enum.selectList.join('\n'),
				}),
				...(field.object && {
					timeStamps: field.object.timestamps,
				}),
				...(field.objectList && {
					timeStamps: field.objectList.timestamps,
				}),
				...(field.reference && {
					referenceAction: field.reference.action,
					referenceModelIid: field.reference.iid,
				}),
			});
		}
	}, [field, open]);

	async function onSubmit(data: z.infer<typeof Schema>) {
		const getDefaultValue = () => {
			if (hasDefaultValue && !data.defaultValue) return '$$unset';

			if ((isReference && database.type !== DatabaseTypes.MongoDB) || isDecimal || isInteger) {
				return Number(data.defaultValue);
			}
			if (isBoolean) return data.defaultValue ? JSON.parse(data.defaultValue) : undefined;
			return data.defaultValue;
		};

		updateField({
			orgId,
			appId,
			versionId,
			dbId,
			modelId,
			fieldId: field._id,
			...data,
			defaultValue: getDefaultValue(),
		});
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader>
					<DrawerTitle>
						{t('database.fields.add_field', {
							field: toDisplayName(form.watch('type')),
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldForm editMode />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
