import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
export default function NumberField({ cell, value, id, index, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const updateData = useUpdateData(field.name);
	const isEditable = useEditedField(field, cell);
	const NumberSchema = z.object({
		[field.name]: z.coerce.number().optional(),
	});

	const form = useForm<z.infer<typeof NumberSchema>>({
		resolver: zodResolver(NumberSchema),
		defaultValues: {
			[field.name]: value,
		},
	});
	function onSubmit(d: z.infer<typeof NumberSchema>) {
		updateData(d, id, index);
	}
	useEffect(() => {
		if (isEditable) {
			form.setValue(field.name, value);
		}
	}, [isEditable]);
	return isEditable ? (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name={field.name}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									type='number'
									error={!!form.formState.errors?.[field.name]}
									{...field}
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
		<div className='truncate'>{value}</div>
	);
}
