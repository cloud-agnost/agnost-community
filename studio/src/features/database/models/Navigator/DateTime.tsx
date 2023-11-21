import { DateText } from '@/components/DateText';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { FieldTypes, NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputMask, MaskProps } from '@react-input/mask';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { DateTime as dt } from 'luxon';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
const MASK_OPTIONS: Record<string, MaskProps> = {
	[FieldTypes.DATE]: {
		mask: 'yyyy-mm-dd',
		replacement: { d: /\d/, m: /\d/, y: /\d/ },
	},
	[FieldTypes.DATETIME]: {
		mask: 'yyyy-mm-dd HH:mm:ss',
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
			[field.name]: formatDate(data[field.name.toLowerCase()]),
		},
	});
	const onSubmit = async (d: z.infer<typeof DateSchema>) => {
		updateData(d, data.id, row?.index as number);
	};
	function formatDate(date: string) {
		if (!date) return '';
		const dateObj = dt.fromISO(date, {
			zone: 'utc',
		});
		if (field.type === FieldTypes.DATETIME) return dateObj.toFormat('yyyy-MM-dd HH:mm:ss');
		if (field.type === FieldTypes.DATE) return dateObj.toFormat('yyyy-MM-dd');
		return data[field.name.toLowerCase()];
	}
	useEffect(() => {
		if (isEditable) {
			form.setValue(field.name, formatDate(data[field.name.toLowerCase()]));
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
