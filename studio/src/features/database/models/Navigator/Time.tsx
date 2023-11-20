import { FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputMask } from '@react-input/mask';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/Form';
import { z } from 'zod';
import { useEffect } from 'react';

export default function Time({ cell, row, field }: NavigatorComponentProps) {
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
			[field.name]: data[field.name],
		},
	});
	const onSubmit = async (d: z.infer<typeof DateSchema>) => {
		updateData(d, data.id, row?.index as number);
	};
	useEffect(() => {
		if (isEditable) {
			form.setValue(field.name, data[field.name]);
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
									mask='HH:mm:ss'
									replacement={{ H: /\d/, m: /\d/, s: /\d/ }}
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
		<time className='text-sm text-default leading-[21px]'>{data[field.name]}</time>
	);
}
