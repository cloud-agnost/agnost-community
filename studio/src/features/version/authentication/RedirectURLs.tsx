import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { useToast } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { cn, isEmpty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from '@phosphor-icons/react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useFieldArray, useForm } from 'react-hook-form';
import { translate as t } from '@/utils';
import * as z from 'zod';

const RedirectURLsSchema = z.object({
	redirectURLs: z
		.array(
			z.object({
				url: z
					.string({
						required_error: t('forms.required', {
							label: t('version.authentication.redirect_url'),
						}),
					})
					.url({
						message: t('forms.invalid', {
							label: t('version.authentication.redirect_url'),
						}),
					}),
			}),
		)
		.nonempty({
			message: t('forms.required', {
				label: t('version.authentication.redirect_url'),
			}),
		}),
});
export default function RedirectURLs() {
	const { notify } = useToast();
	const { version, saveRedirectURLs } = useVersionStore();
	const form = useForm<z.infer<typeof RedirectURLsSchema>>({
		resolver: zodResolver(RedirectURLsSchema),
		defaultValues: {
			redirectURLs: version?.authentication?.redirectURLs.map((r) => ({ url: r })) ?? [{ url: '' }],
		},
	});
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'redirectURLs',
	});

	function onSubmit(data: z.infer<typeof RedirectURLsSchema>) {
		saveRedirectURLs({
			orgId: version?.orgId as string,
			versionId: version?._id as string,
			appId: version?.appId as string,
			redirectURLs: data.redirectURLs.map((r) => r.url),
			onSuccess: () => {
				notify({
					type: 'success',
					title: t('general.success'),
					description: t('version.authentication.redirect_url_success'),
				});
			},
		});
	}

	return (
		<SettingsFormItem
			className='py-0'
			contentClassName='p-4 border border-border rounded-lg space-y-4'
			title={t('version.authentication.redirect_url')}
			description={t('version.authentication.redirect_url_desc')}
		>
			<div className='flex items-center justify-between'>
				<p className='text-subtle font-sfCompact'>{t('version.authentication.urls')}</p>
				<Button
					variant='secondary'
					onClick={() => {
						append({
							url: '',
						});
					}}
				>
					<Plus className='mr-2' />
					{t('version.authentication.add_redirect_url')}
				</Button>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 flex flex-col'>
					{fields.map((f, index) => (
						<div className='flex gap-4' key={f.id}>
							<FormField
								control={form.control}
								name={`redirectURLs.${index}.url`}
								render={({ field }) => (
									<FormItem className='flex-1'>
										{index === 0 && (
											<FormLabel>{t('version.authentication.redirect_url')}</FormLabel>
										)}
										<FormControl>
											<Input
												placeholder={
													t('forms.placeholder', {
														label: t('version.authentication.redirect_url'),
													}) ?? ''
												}
												error={!!form.formState.errors.redirectURLs?.[index]?.url}
												{...field}
											/>
										</FormControl>
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
									!isEmpty(form.formState.errors) && !index && 'self-center mt-2',
									!isEmpty(form.formState.errors) &&
										isEmpty(form.formState.errors.redirectURLs?.[0]) &&
										!index &&
										'self-end',
								)}
								onClick={() => {
									remove(index);
								}}
							>
								<Trash size={16} className='text-subtle' />
							</Button>
						</div>
					))}
					<Button size='lg' type='submit' variant='primary' className='self-end'>
						{t('general.save')}
					</Button>
				</form>
			</Form>
		</SettingsFormItem>
	);
}
