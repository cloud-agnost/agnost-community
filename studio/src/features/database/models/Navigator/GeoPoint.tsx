import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useEditedField, useUpdateData } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { isEmpty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export default function GeoPoint({ cell, value, id, index, field }: NavigatorComponentProps) {
	const name = field.name;

	const updateData = useUpdateData(field.name);
	const isEditable = useEditedField(field, cell);
	const database = useDatabaseStore((state) => state.database);
	const coords = {
		lat: database.type === 'MongoDB' ? value?.coordinates?.[0] : value?.x,
		lng: database.type === 'MongoDB' ? value?.coordinates?.[1] : value?.y,
	};

	const GeoPointSchema = z.object({
		[name]: z.object({
			lat: z.coerce.number().optional(),
			lng: z.coerce.number().optional(),
		}),
	});
	const form = useForm<z.infer<typeof GeoPointSchema>>({
		resolver: zodResolver(GeoPointSchema),
		defaultValues: {
			[name]: coords,
		},
	});
	const { setEditedField } = useNavigatorStore.getState();

	function onSubmit(data: z.infer<typeof GeoPointSchema>) {
		updateData({ [name]: [data[name].lat, data[name].lng] }, id, index);
	}
	useEffect(() => {
		if (isEditable) {
			form.setValue(name, coords);
		}
	}, [isEditable]);

	return isEditable ? (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='flex gap-4'>
				<FormField
					control={form.control}
					name={`${name}.lat`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									type='number'
									error={!!form.formState.errors?.[field.name]?.lat}
									{...field}
									onBlur={() => {
										form.handleSubmit(onSubmit)();
										if (form.formState.errors?.[field.name]?.lat) setEditedField('');
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={`${name}.lng`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									type='number'
									error={!!form.formState.errors?.[field.name]?.lng}
									{...field}
									onBlur={() => {
										form.handleSubmit(onSubmit)();
										if (form.formState.errors?.[field.name]?.lng) setEditedField('');
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
		<span>
			{coords.lat}
			{!isEmpty(coords.lat) && !isEmpty(coords.lng) && ', '}
			{coords.lng}
		</span>
	);
}
