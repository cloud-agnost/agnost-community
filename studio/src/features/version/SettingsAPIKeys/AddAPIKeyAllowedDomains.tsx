import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { Button } from 'components/Button';
import * as z from 'zod';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Input } from 'components/Input';
import { cn, isEmpty } from '@/utils';
import { Plus, Trash } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { Schema } from '@/features/version/SettingsAPIKeys';

export default function AddAPIKeyGeneral() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof Schema>>();

	useEffect(() => {
		console.log(form.formState.errors);
	}, [form.formState.errors]);

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'domain.list',
	});

	const hasAtLestOneError = !!form.formState.errors.domain?.list?.message;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='p-6 flex flex-col gap-2'
		>
			{fields.map((field, index) => {
				const last = index === fields.length - 1;
				return (
					<div className='flex gap-2' key={field.id}>
						<FormField
							control={form.control}
							name={`domain.list.${index}.domain`}
							render={({ field }) => {
								return (
									<FormItem className='flex-1'>
										{index === 0 && <FormLabel>{t('general.domain')}</FormLabel>}
										<FormControl>
											<Input
												placeholder={
													t('forms.placeholder', {
														label: t('general.domain'),
													}) ?? ''
												}
												error={
													(last && !!form.formState.errors.domain?.list) ||
													!!form.formState.errors.domain?.list?.[index]?.domain
												}
												{...field}
											/>
										</FormControl>
										{last && hasAtLestOneError ? (
											<FormMessage>{form.formState.errors.domain?.list?.message}</FormMessage>
										) : (
											<FormMessage />
										)}
									</FormItem>
								);
							}}
						/>

						<Button
							type='button'
							variant='secondary'
							disabled={fields.length === 1}
							className={cn(
								fields.length === 1 && !isEmpty(form.formState.errors.domain?.list)
									? 'self-center mt-2'
									: index === 0 && !isEmpty(form.formState.errors?.domain?.list?.[index])
									? 'self-center mt-2'
									: index === 0 && 'self-end',
								index !== 0 &&
									!isEmpty(form.formState.errors.domain?.list?.[index]) &&
									'self-start',
							)}
							onClick={() => {
								remove(index);
							}}
						>
							<Trash size={16} className='text-subtle' />
						</Button>
					</div>
				);
			})}
			<Button
				type='button'
				variant='text'
				onClick={() => {
					append({ domain: '' });
				}}
			>
				<Plus size={16} />
				<span className='ml-2'>Add Another One</span>
			</Button>
		</motion.div>
	);
}
