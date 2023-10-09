import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/Form';
import { Separator } from '@/components/Separator';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { Switch } from '@/components/Switch';
import useVersionStore from '@/store/version/versionStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EmailSmtpForm from './EmailSmtpForm';
import { useToast } from '@/hooks';
import { useState } from 'react';
import { translate as t } from '@/utils';
import { SMTPSchema } from '@/types';
export const EmailAuthenticationSchema = z.object({
	enabled: z.boolean().default(true),
	confirmEmail: z.boolean().default(false),
	expiresIn: z.coerce
		.number({
			required_error: t('forms.required', {
				label: t('version.authentication.link_expiry_duration'),
			}),
		})
		.int()
		.positive(),
	customSMTP: SMTPSchema,
});

export default function EmailAuthentication() {
	const { notify } = useToast();
	const [loading, setLoading] = useState(false);
	const { version, saveEmailAuthSettings } = useVersionStore();
	const form = useForm<z.infer<typeof EmailAuthenticationSchema>>({
		resolver: zodResolver(EmailAuthenticationSchema),
		defaultValues: version?.authentication.email,
	});
	function onSubmit(data: z.infer<typeof EmailAuthenticationSchema>) {
		setLoading(true);
		saveEmailAuthSettings({
			versionId: version._id,
			orgId: version.orgId,
			appId: version.appId,
			...data,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('version.authentication.email_authentication_success'),
					type: 'success',
				});
			},
			onError: (error) => {
				setLoading(false);
				notify({
					title: t('general.error'),
					description: error.details,
					type: 'error',
				});
			},
		});
	}
	return (
		<SettingsFormItem
			className='py-0'
			contentClassName='p-4 border border-border rounded-lg space-y-4'
			title={t('version.authentication.email_authentication')}
			description={t('version.authentication.email_authentication_desc')}
		>
			<Form {...form}>
				<form className='space-y-6 flex flex-col' onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name='enabled'
						render={({ field }) => (
							<FormItem className='flex justify-between gap-4 items-center space-y-0'>
								<FormLabel>{t('version.authentication.email_authentication_title')}</FormLabel>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>
					<Separator />
					<FormField
						control={form.control}
						name='confirmEmail'
						render={({ field }) => (
							<FormItem className='flex space-y-0 space-x-4'>
								<FormControl className='self-start'>
									<Checkbox
										disabled={!form.getValues('enabled')}
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className='space-y-2'>
									<FormLabel className='block'>
										{t('version.authentication.confirm_email')}
									</FormLabel>
									<FormLabel className='block text-subtle'>
										{t('version.authentication.confirm_email_desc')}
									</FormLabel>
									{form.watch('confirmEmail') && <EmailSmtpForm />}
								</div>
							</FormItem>
						)}
					/>

					<Button className='self-end' type='submit' variant='primary' size='lg' loading={loading}>
						{t('general.save')}
					</Button>
				</form>
			</Form>
		</SettingsFormItem>
	);
}
