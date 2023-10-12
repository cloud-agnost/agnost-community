import { DatePicker } from '@/components/DatePicker';
import { DateText } from '@/components/DateText';
import { useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export default function DateTime({ isEditable, row, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const data = row?.original;
	const updateData = useUpdateData(field);
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
	return isEditable ? (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name={field.name}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<DatePicker
									mode='single'
									selected={field.value}
									onSelect={(date) => {
										field.onChange(date);
										form.handleSubmit(onSubmit)();
										if (form.formState.errors?.[field.name]) setEditedField('');
									}}
									initialFocus
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	) : (
		<DateText date={data[field.name]} />
	);
}
