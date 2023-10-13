import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
export default function NumberField({ isEditable, row, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const updateData = useUpdateData(field);
	const data = row?.original;
	const NumberSchema = z.object({
		[field.name]: z.coerce.number().optional(),
	});

	const form = useForm<z.infer<typeof NumberSchema>>({
		resolver: zodResolver(NumberSchema),
		defaultValues: {
			[field.name]: data[field.name],
		},
	});
	function onSubmit(d: z.infer<typeof NumberSchema>) {
		updateData(d, data.id, row?.index as number);
	}
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
		<div className='truncate'>{data[field.name]}</div>
	);
}
