import { Badge } from '@/components/Badge';
import { Switch } from '@/components/Switch';
import { BADGE_COLOR_MAP } from '@/constants';
import { useEditedField, useUpdateData } from '@/hooks';
import useNavigatorStore from '@/store/database/navigatorStore';
import { NavigatorComponentProps } from '@/types';
import { capitalize } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
export default function BooleanField({ cell, value, id, index, field }: NavigatorComponentProps) {
	const name = field.name;
	const { t } = useTranslation();
	const { setEditedField } = useNavigatorStore();
	const isEditable = useEditedField(field, cell);
	const label = value ? t('general.yes') : t('general.no');
	const updateData = useUpdateData(field.name);
	const BooleanSchema = z.object({
		[name]: z.boolean(),
	});

	const form = useForm({
		resolver: zodResolver(BooleanSchema),
		defaultValues: {
			[name]: value,
		},
	});

	const onSubmit = async (d: z.infer<typeof BooleanSchema>) => {
		updateData(d, id, index);
	};

	useEffect(() => {
		if (isEditable) {
			form.setValue(name, value);
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
