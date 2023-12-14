import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
export default function Json({ cell, value, id, index, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const updateData = useUpdateData(field.name);
	const isEditable = useEditedField(field, cell);
	const JSONSchema = z.object({
		[field.name]: z.string().optional(),
	});

	const form = useForm<z.infer<typeof JSONSchema>>({
		resolver: zodResolver(JSONSchema),
		defaultValues: {
			[field.name]: JSON.stringify(value),
		},
	});

	function onSubmit(d: z.infer<typeof JSONSchema>) {
		updateData(
			{
				[field.name]: JSON.parse(d[field.name]?.toString() ?? ''),
			},
			id,
			index,
		);
	}
	useEffect(() => {
		if (isEditable) {
			form.setValue(field.name, JSON.stringify(value));
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
									{...field}
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
		<pre className='truncate'>{JSON.stringify(value)}</pre>
	);
}
