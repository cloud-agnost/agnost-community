import { DateText } from '@/components/DateText';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { FieldTypes, NavigatorComponentProps } from '@/types';
import { DATE_FORMAT, DATE_TIME_FORMAT, formatDate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputMask, MaskProps } from '@react-input/mask';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const MASK_OPTIONS: Record<string, MaskProps> = {
	[FieldTypes.DATE]: {
		mask: DATE_FORMAT,
		replacement: { d: /\d/, m: /\d/, y: /\d/ },
	},
	[FieldTypes.DATETIME]: {
		mask: DATE_TIME_FORMAT,
		replacement: { d: /\d/, m: /\d/, y: /\d/, H: /\d/, M: /\d/, s: /\d/ },
	},
};
export default function DateTime({ cell, row, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const data = row?.original;
	const updateData = useUpdateData(field);
	const isEditable = useEditedField(field, cell);

	const DateSchema = z.object({
		[field.name]: z.string().optional(),
	});

	const form = useForm({
		resolver: zodResolver(DateSchema),
		defaultValues: {
			[field.name]: convertDates(data[field.name.toLowerCase()]),
		},
	});
	const onSubmit = async (d: z.infer<typeof DateSchema>) => {
		updateData(d, data.id, row?.index as number);
	};
	function convertDates(date: string) {
		if (!date) return '';

		if (field.type === FieldTypes.DATETIME) return formatDate(date, DATE_TIME_FORMAT);
		if (field.type === FieldTypes.DATE) return formatDate(date, DATE_FORMAT);
		return data[field.name.toLowerCase()];
	}
	useEffect(() => {
		if (isEditable) {
			form.setValue(field.name, convertDates(data[field.name.toLowerCase()]));
		}
	}, [isEditable]);
	return isEditable ? (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name={field.name}
					render={({ field: fd }) => (
						<FormItem>
							<FormControl>
								<InputMask
									component={Input}
									showMask
									mask={MASK_OPTIONS[field.type].mask}
									replacement={MASK_OPTIONS[field.type].replacement}
									{...fd}
									error={!!form.formState.errors?.[field.name]}
									onBlur={() => {
										form.handleSubmit(onSubmit)();
										if (form.formState.errors?.[field.name]) setEditedField('');
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	) : (
		<DateText date={data[field.name.toLowerCase()]} />
	);
}
