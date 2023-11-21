import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as z from 'zod';
export default function LinkField({ cell, row, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const data = row?.original;
	const updateData = useUpdateData(field);
	const isEditable = useEditedField(field, cell);
	const LinkSchema = z.object({
		[field.name]: z.string().optional(),
	});
	const form = useForm<z.infer<typeof LinkSchema>>({
		resolver: zodResolver(LinkSchema),
		defaultValues: {
			[field.name]: data[field.name],
		},
	});

	function onSubmit(d: z.infer<typeof LinkSchema>) {
		updateData(
			{
				[field.name]: d[field.name],
			},
			data.id,
			row?.index as number,
		);
	}

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
		<Link
			to={data[field.name]}
			className='link truncate block'
			target='_blank'
			rel='noopener noreferrer'
		>
			{data[field.name]}
		</Link>
	);
}
