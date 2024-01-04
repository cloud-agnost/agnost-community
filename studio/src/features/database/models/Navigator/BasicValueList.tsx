import { Badge } from '@/components/Badge';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
export default function BasicValueList({ cell, id, value, index, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();

	const updateData = useUpdateData(field.name);
	const isEditable = useEditedField(field, cell);
	const BVLSchema = z.object({
		[field.name]: z.string().optional(),
	});
	const form = useForm<z.infer<typeof BVLSchema>>({
		resolver: zodResolver(BVLSchema),
		defaultValues: {
			[field.name]: value.join(','),
		},
	});

	function onSubmit(d: z.infer<typeof BVLSchema>) {
		updateData(
			{
				[field.name]: d[field.name]?.split(',').map((val) => val.trim()),
			},
			id,
			index as number,
		);
	}
	useEffect(() => {
		if (isEditable) {
			form.setValue(field.name, value?.join(','));
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
		<div className='flex flex-wrap'>
			{value?.map((val: string) => <Badge text={val} className='mr-2 mb-2' key={val} />)}
		</div>
	);
}
