import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
export default function Enum({ isEditable, row, field: dbField }: NavigatorComponentProps) {
	const updateData = useUpdateData(dbField);
	const { t } = useTranslation();
	const { setEditedField } = useNavigatorStore();
	const data = row?.original;
	const EnumSchema = z.object({
		[dbField.name]: z
			.string()

			.refine((v) => dbField.enum?.selectList.includes(v), {
				message: 'This field must be one of the options',
			}),
	});
	const form = useForm<z.infer<typeof EnumSchema>>({
		resolver: zodResolver(EnumSchema),
		defaultValues: {
			[dbField.name]: data[dbField.name],
		},
	});

	function onSubmit(d: z.infer<typeof EnumSchema>) {
		updateData(
			{
				[dbField.name]: d[dbField.name],
			},
			data.id,
			row?.index as number,
		);
	}
	return isEditable ? (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name={dbField.name}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<FormControl>
									<Select
										defaultValue={field.value}
										value={field.value}
										name={field.name}
										onValueChange={(value) => {
											field.onChange(value);
											form.handleSubmit(onSubmit)();
											if (form.formState.errors?.[field.name]) setEditedField('');
										}}
									>
										<FormControl>
											<SelectTrigger
												error={Boolean(form.formState.errors.resourceId)}
												className='w-full'
											>
												<SelectValue placeholder={`${t('general.select')} `} />
											</SelectTrigger>
										</FormControl>
										<SelectContent align='center'>
											{dbField.enum?.selectList.map((em) => (
												<SelectItem key={em} value={em}>
													{em}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	) : (
		<div className='truncate'>{data[dbField.name]}</div>
	);
}
