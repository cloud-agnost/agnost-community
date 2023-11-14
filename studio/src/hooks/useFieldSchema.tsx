import {
	BOOLEAN_DEFAULTS,
	DATABASE_TEXT_CAPACITIES,
	DATETIME_DEFAULTS,
	DEFAULT_VALUE_DISABLED_TYPES,
	EMAIL_REGEX,
	MAX_LENGTHS,
	MYSQL_RESERVED_WORDS,
	POSTGRES_RESERVED_WORDS,
	REFERENCE_FIELD_ACTION,
	SQL_SERVER_RESERVED_WORDS,
	URL_REGEX,
} from '@/constants';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useTypeStore from '@/store/types/typeStore';
import { DatabaseTypes, FieldTypes, NameSchema, TimestampsSchema } from '@/types';
import { capitalize, isMobilePhone } from '@/utils';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
export default function useFieldSchema() {
	const { t } = useTranslation();

	const { models, selectedType } = useModelStore();
	const database = useDatabaseStore((state) => state.database);

	const languages = useTypeStore((state) => state.ftsIndexLanguages);
	const languageOptions = {
		[DatabaseTypes.MongoDB]: languages.MongoDB,
		[DatabaseTypes.MySQL]: languages.MySQL,
		[DatabaseTypes.PostgreSQL]: languages.PostgreSQL,
		[DatabaseTypes.SQLServer]: languages['SQL Server'],
	}[database?.type];

	const fieldType = selectedType?.name;

	const hasDefaultValue = !DEFAULT_VALUE_DISABLED_TYPES.includes(fieldType);
	const hasMaxLength = [FieldTypes.TEXT, FieldTypes.ENCRYPTED_TEXT].includes(
		selectedType.name as FieldTypes,
	);
	const MAX_LENGTH = MAX_LENGTHS[fieldType];
	const isDecimal = fieldType === FieldTypes.DECIMAL;
	const isBoolean = fieldType === FieldTypes.BOOLEAN;
	const isInteger = fieldType === FieldTypes.INTEGER;
	const isEnum = fieldType === FieldTypes.ENUM;
	const isReference = fieldType === FieldTypes.REFERENCE;
	const isDatetime = fieldType === FieldTypes.DATETIME;
	const isDate = fieldType === FieldTypes.DATE;
	const isGeoPoint = fieldType === FieldTypes.GEO_POINT;
	const isText = fieldType === FieldTypes.TEXT;
	const isObject = fieldType === FieldTypes.OBJECT;
	const isObjectList = fieldType === FieldTypes.OBJECT_LIST;
	const isRichText = fieldType === FieldTypes.RICH_TEXT;

	const defaults = isDatetime || isDate ? DATETIME_DEFAULTS : isBoolean ? BOOLEAN_DEFAULTS : [];

	const Schema = z
		.object({
			name: NameSchema,
			required: z.boolean(),
			type: z.nativeEnum(FieldTypes),
			unique: z.boolean(),
			indexed: z.boolean(),
			searchable: z.boolean(),
			immutable: z.boolean(),
			defaultValue: z.string().optional(),
			description: z.string().optional(),
			language: z.string().optional(),
			maxLength: z
				.string()
				.regex(/^\d+$/, {
					message: t('forms.number', {
						label: capitalize(t('general.max_length').toLowerCase()),
					}).toString(),
				})
				.optional(),
			decimalDigits: z
				.number({
					invalid_type_error: t('forms.number', {
						label: capitalize(t('general.decimal_digits').toLowerCase()),
					}).toString(),
				})
				.min(1, {
					message: t('forms.decimal.decimal_digits_range', {
						length: MAX_LENGTH,
						min_decimal_digits: 1,
						max_decimal_digits: MAX_LENGTH,
					}).toString(),
				})
				.max(MAX_LENGTH, {
					message: t('forms.decimal.decimal_digits_range', {
						length: MAX_LENGTH,
						min_decimal_digits: 1,
						max_decimal_digits: MAX_LENGTH,
					}).toString(),
				})
				.optional(),
			referenceModelIid: z.string().optional(),
			referenceAction: z.enum(REFERENCE_FIELD_ACTION).optional(),
			enumSelectList: z.string().optional(),
			timeStamps: TimestampsSchema,
		})
		.superRefine((arg, ctx) => {
			const type = selectedType?.name as FieldTypes;
			validateDefaultValueForType(arg, ctx);
			validateReferenceModelIid(arg, ctx);
			validateReferenceAction(arg, ctx);
			validateReservedWords(arg, ctx);

			//TODO: ask ozgur about this
			// if (
			// 	editMode &&
			// 	hasMaxLength &&
			// 	((fieldToEdit.text?.maxLength && Number(arg.maxLength) < fieldToEdit.text.maxLength) ||
			// 		(fieldToEdit.encryptedText?.maxLength &&
			// 			Number(arg.maxLength) < fieldToEdit.encryptedText.maxLength))
			// ) {
			// 	ctx.addIssue({
			// 		code: z.ZodIssueCode.custom,
			// 		message: t('forms.fieldMaxLength.error').toString(),
			// 		path: ['maxLength'],
			// 	});
			// }

			if ([FieldTypes.TEXT, FieldTypes.ENCRYPTED_TEXT].includes(type)) {
				const maxLength =
					type === FieldTypes.TEXT ? DATABASE_TEXT_CAPACITIES[database.type] : MAX_LENGTH;

				if (_.inRange(Number(arg.maxLength), 1, maxLength)) {
					const label = capitalize(t('general.max_length').toLowerCase());
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.maxLength.error', { length: maxLength, label }).toString(),
						path: ['maxLength'],
					});
				}
			}
			if (
				type === FieldTypes.ENUM &&
				(!arg.enumSelectList || arg.enumSelectList?.trim().length === 0)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.enterAtLeastOneValue').toString(),
					path: ['enumSelectList'],
				});
			}

			if (type === FieldTypes.DECIMAL && !arg.decimalDigits) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: capitalize(t('general.decimal_digits').toLowerCase()),
					}).toString(),
					path: ['decimalDigits'],
				});
			}

			if (arg.searchable && languageOptions && !arg.language) {
				const label =
					database.type === DatabaseTypes.MySQL
						? t('database.fields.searchable.collation.title')
						: t('database.fields.searchable.lang.title');

				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: capitalize(label.toLowerCase()),
					}).toString(),
					path: ['language'],
				});
			}
		});

	const validateDefaultValueForType = (arg: z.infer<typeof Schema>, ctx: z.RefinementCtx) => {
		const { defaultValue, type, decimalDigits, maxLength, enumSelectList } = arg;
		const _maxLength = Number(maxLength);
		const checkInvalidDefaultValue = () => {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: t('forms.invalid', {
					label: capitalize(t('general.default_value').toLowerCase()),
				}).toString(),
				path: ['defaultValue'],
			});
		};

		if (!defaultValue) return;
		switch (type) {
			case FieldTypes.INTEGER:
				if (!Number.isInteger(Number(defaultValue))) {
					checkInvalidDefaultValue();
				}
				break;
			case FieldTypes.TEXT:
			case FieldTypes.ENCRYPTED_TEXT:
				if (maxLength && defaultValue.length > _maxLength) {
					checkInvalidDefaultValue();
				}
				break;
			case FieldTypes.ENUM:
				if (!enumSelectList?.trim().split('\n').includes(defaultValue)) {
					checkInvalidDefaultValue();
				}
				break;
			case FieldTypes.DECIMAL:
				if (isNaN(Number(defaultValue))) {
					checkInvalidDefaultValue();
				}
				if (decimalDigits) {
					const decimalDigitsLength = defaultValue?.split('.')[1]?.length ?? 0;
					if (decimalDigitsLength > decimalDigits) {
						checkInvalidDefaultValue();
					}
				}

				break;
			case FieldTypes.PHONE:
				if (defaultValue.length > 15 || !isMobilePhone(defaultValue)) {
					checkInvalidDefaultValue();
				}

				break;
			case FieldTypes.EMAIL:
				if (defaultValue.length > 254 || !EMAIL_REGEX.test(defaultValue)) {
					checkInvalidDefaultValue();
				}

				break;
			case FieldTypes.LINK:
				if (defaultValue.length > 2083 || !URL_REGEX.test(defaultValue)) {
					checkInvalidDefaultValue();
				}

				break;
			case FieldTypes.REFERENCE:
				if (database.type !== DatabaseTypes.MongoDB && isNaN(Number(defaultValue))) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.number', {
							label: capitalize(t('general.default_value').toLowerCase()),
						}).toString(),
						path: ['defaultValue'],
					});
				}
				break;
		}
	};

	const validateReferenceModelIid = (arg: z.infer<typeof Schema>, ctx: z.RefinementCtx) => {
		const { referenceModelIid, type } = arg;
		if (type === FieldTypes.REFERENCE && !referenceModelIid) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: t('forms.required', {
					label: capitalize(t('database.fields.reference_model').toLowerCase()),
				}).toString(),
				path: ['referenceModelIid'],
			});
		}
		if (
			type === FieldTypes.REFERENCE &&
			referenceModelIid &&
			!models.some((model) => model.iid === referenceModelIid)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: t('forms.invalid', {
					label: capitalize(t('database.fields.reference_model').toLowerCase()),
				}).toString(),
				path: ['referenceModelIid'],
			});
		}
	};

	const validateReferenceAction = (arg: z.infer<typeof Schema>, ctx: z.RefinementCtx) => {
		const { type, referenceAction } = arg;
		if (
			type === FieldTypes.REFERENCE &&
			database.type !== DatabaseTypes.MongoDB &&
			!referenceAction
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: t('forms.required', {
					label: capitalize(t('database.fields.reference_action').toLowerCase()),
				}).toString(),
				path: ['referenceAction'],
			});
		}
	};

	const validateReservedWords = (arg: z.infer<typeof Schema>, ctx: z.RefinementCtx) => {
		const { name } = arg;
		const reservedWords = {
			[DatabaseTypes.PostgreSQL]: POSTGRES_RESERVED_WORDS,
			[DatabaseTypes.MySQL]: MYSQL_RESERVED_WORDS,
			[DatabaseTypes.SQLServer]: SQL_SERVER_RESERVED_WORDS,
		}[database?.type];

		if (reservedWords?.includes(name.toLowerCase())) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: t('forms.reservedWord', {
					label: name,
				}).toString(),
				path: ['name'],
			});
		}
	};

	return {
		Schema,
		languageOptions,
		typeCheck: {
			hasDefaultValue,
			isReference,
			isBoolean,
			isDecimal,
			isInteger,
			isEnum,
			isDatetime,
			isDate,
			isGeoPoint,
			isText,
			hasMaxLength,
			isObject,
			isObjectList,
			isRichText,
		},
		maxLength: MAX_LENGTH,
		defaults,
	};
}
