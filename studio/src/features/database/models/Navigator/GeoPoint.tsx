import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export default function GeoPoint({ isEditable, row, field }: NavigatorComponentProps) {
	const name = field.name;
	const data = row?.original;
	const id = data?.id;
	const updateData = useUpdateData(field);
	const GeoPointSchema = z.object({
		[name]: z.object({
			lat: z.coerce.number().optional(),
			lng: z.coerce.number().optional(),
		}),
	});
	const form = useForm<z.infer<typeof GeoPointSchema>>({
		resolver: zodResolver(GeoPointSchema),
		defaultValues: {
			[name]: {
				lat: data?.[name]?.coordinates?.[0],
				lng: data?.[name]?.coordinates?.[1],
			},
		},
	});
	const { setEditedField } = useNavigatorStore.getState();

	function onSubmit(data: z.infer<typeof GeoPointSchema>) {
		updateData({ [name]: [data[name].lat, data[name].lng] }, id, row?.index as number);
	}

	return isEditable ? (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
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
			{data?.[name]?.coordinates?.[0]}, {data?.[name]?.coordinates?.[1]}
		</span>
	);
}
