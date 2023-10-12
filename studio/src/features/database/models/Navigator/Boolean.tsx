import { Badge } from '@/components/Badge';
import { Switch } from '@/components/Switch';
import { BADGE_COLOR_MAP } from '@/constants';
import { useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { capitalize } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
export default function BooleanField({ isEditable, row, field }: NavigatorComponentProps) {
	const name = field.name;
	const { t } = useTranslation();
	const data = row?.original;
	const { setEditedField } = useNavigatorStore();
	const label = data[name] ? t('general.yes') : t('general.no');
	const updateData = useUpdateData(field);
	const BooleanSchema = z.object({
		[name]: z.boolean(),
	});

	const form = useForm({
		resolver: zodResolver(BooleanSchema),
		defaultValues: {
			[name]: data[name],
		},
	});

	const onSubmit = async (d: z.infer<typeof BooleanSchema>) => {
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
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
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
		<Badge variant={BADGE_COLOR_MAP[label.toUpperCase()]} text={capitalize(label)} rounded />
	);
}
