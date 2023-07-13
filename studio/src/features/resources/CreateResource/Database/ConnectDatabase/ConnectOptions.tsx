import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cn, isEmpty } from '@/utils';
import { Plus, Trash } from '@phosphor-icons/react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CreateResourceItem from '../../../CreateResourceItem';
import { useEffect } from 'react';
import { ConnectDatabaseSchema } from '@/types';
import * as z from 'zod';

export default function ConnectOptions() {
	const { t } = useTranslation();

	const {
		control,
		formState: { errors },
	} = useFormContext<z.infer<typeof ConnectDatabaseSchema>>();

	const { fields, append, remove } = useFieldArray({
		control: control,
		name: 'access.options',
	});
	useEffect(() => {
		append({ key: '', value: '' });
	}, []);
	return (
		<CreateResourceItem title={t('resources.database.connection_options')}>
			{fields.map((f, index) => (
				<div className='flex gap-4' key={f.id}>
					<FormField
						control={control}
						name={`access.options.${index}.key`}
						render={({ field }) => (
							<FormItem className='flex-1'>
								{index === 0 && <FormLabel>{t('resources.database.key')}</FormLabel>}
								<FormControl>
									<Input
										placeholder={
											t('forms.placeholder', {
												label: t('resources.database.key'),
											}) ?? ''
										}
										error={!!errors.access?.options?.[index]?.key}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name={`access.options.${index}.value`}
						render={({ field }) => (
							<FormItem className='flex-1'>
								{index === 0 && <FormLabel>{t('resources.database.value')}</FormLabel>}

								<Input
									placeholder={
										t('forms.placeholder', {
											label: t('resources.database.value'),
										}) ?? ''
									}
									error={!!errors.access?.options?.[index]?.value}
									{...field}
								/>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type='button'
						variant='secondary'
						disabled={fields.length === 1}
						iconOnly
						className={cn(
							!index && 'self-end',
							!isEmpty(errors) && !index && 'self-center mt-2',
							!isEmpty(errors) && isEmpty(errors.access?.options?.[0]) && !index && 'self-end',
						)}
						onClick={() => {
							remove(index);
						}}
					>
						<Trash size={16} className='text-subtle' />
					</Button>
				</div>
			))}
			<div className='flex justify-between items-center mt-8'>
				{fields.length < 50 && (
					<Button
						type='button'
						variant='text'
						onClick={() => {
							append({ key: '', value: '' });
						}}
					>
						<Plus size={16} className='text-brand-primary' />
						<span className='text-brand-primary ml-2'>{t('general.add_another_one')}</span>
					</Button>
				)}
			</div>
		</CreateResourceItem>
	);
}
