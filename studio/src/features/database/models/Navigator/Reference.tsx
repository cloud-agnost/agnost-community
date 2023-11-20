import { Button } from '@/components/Button';
import useModelStore from '@/store/database/modelStore';
import { Model, NavigatorComponentProps } from '@/types';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import * as z from 'zod';
import { Input } from '@/components/Input';
import { useForm } from 'react-hook-form';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
export default function Reference({ cell, row, field }: NavigatorComponentProps) {
	const [searchParams, setSearchParams] = useSearchParams();
	const data = row?.original;
	const isEditable = useEditedField(field, cell);
	const { models, setModel } = useModelStore();
	const { setEditedField } = useNavigatorStore();
	const updateData = useUpdateData(field);
	useEffect(() => {
		if (searchParams.get('ref') && searchParams.get('ref') === data[field.name]) {
			console.log('here');
			setModel(models.find((m) => m.iid === field.reference?.iid) as Model);
		}
	}, [searchParams]);

	const ReferenceSchema = z.object({
		[field.name]: z.string().optional(),
	});

	const form = useForm<z.infer<typeof ReferenceSchema>>({
		defaultValues: {
			[field.name]: data[field.name],
		},
	});

	function onSubmit(d: z.infer<typeof ReferenceSchema>) {
		updateData(d, data.id, row?.index as number);
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
		<Button
			variant='blank'
			className='link'
			onClick={() => {
				searchParams.set('ref', data[field.name]);
				setSearchParams(searchParams);
			}}
		>
			{data[field.name]}
		</Button>
	);
}
