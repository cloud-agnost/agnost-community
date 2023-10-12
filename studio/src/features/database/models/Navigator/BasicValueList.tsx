import { Badge } from '@/components/Badge';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
export default function BasicValueList({ isEditable, row, field }: NavigatorComponentProps) {
	const { setEditedField } = useNavigatorStore();
	const data = row?.original;
	const updateData = useUpdateData(field);
	const BVLSchema = z.object({
		[field.name]: z.string().optional(),
	});
	const form = useForm<z.infer<typeof BVLSchema>>({
		resolver: zodResolver(BVLSchema),
		defaultValues: {
			[field.name]: data[field.name]?.join(','),
		},
	});

	function onSubmit(d: z.infer<typeof BVLSchema>) {
		updateData(
			{
				[field.name]: d[field.name]?.split(',').map((val) => val.trim()),
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
			{data[field.name]?.map((val: string) => <Badge text={val} className='mr-2 mb-2' key={val} />)}
		</div>
	);
}
