import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Button } from 'components/Button';

import './changePassword.scss';
import { useTranslation } from 'react-i18next';
import { translate } from '@/utils';
import { useEffect, useState } from 'react';
import { PasswordInput } from 'components/PasswordInput';

const FormSchema = z.object({
	currentPassword: z
		.string({
			required_error: translate('forms.required', {
				label: translate('profileSettings.current_password'),
			}),
		})
		.min(8, {
			message: translate('forms.min8.error', {
				label: translate('profileSettings.current_password'),
			}),
		}),
	newPassword: z
		.object({
			password: z
				.string({
					required_error: translate('forms.required', {
						label: translate('profileSettings.new_password'),
					}),
				})
				.min(8, {
					message: translate('forms.min8.error', {
						label: translate('profileSettings.new_password'),
					}),
				}),
			confirm: z
				.string({
					required_error: translate('forms.required', {
						label: translate('profileSettings.confirm_new_password'),
					}),
				})
				.min(8, {
					message: translate('forms.min8.error', {
						label: translate('profileSettings.confirm_new_password'),
					}),
				}),
		})
		.refine((data) => data.password === data.confirm, {
			message: translate('profileSettings.password_dont_match'),
			path: ['confirm'],
		}),
});

export default function ChangePassword() {
	const [isChangeMode, setIsChangeMode] = useState(false);
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	useEffect(() => {
		return () => {
			form.reset();
		};
	}, [isChangeMode]);

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log(data);
	}

	function openModal() {
		setIsChangeMode(true);
	}

	function closeModal() {
		setIsChangeMode(false);
	}

	return (
		<div>
			{isChangeMode ? (
				<Form {...form}>
					<form className='change-email-form' onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='currentPassword'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profileSettings.current_password')}</FormLabel>
									<FormControl>
										<PasswordInput
											error={Boolean(form.formState.errors.currentPassword)}
											placeholder={t('profileSettings.current_password_placeholder') ?? ''}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.min8.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='newPassword.password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profileSettings.new_password')}</FormLabel>
									<FormControl>
										<PasswordInput
											error={Boolean(form.formState.errors.newPassword?.password)}
											placeholder={t('profileSettings.new_password_placeholder') ?? ''}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.min8.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='newPassword.confirm'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('profileSettings.confirm_new_password')}</FormLabel>
									<FormControl>
										<PasswordInput
											error={Boolean(form.formState.errors.newPassword?.confirm)}
											placeholder={t('profileSettings.confirm_new_password_placeholder') ?? ''}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.min8.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='mt-4 flex gap-4 justify-end'>
							<Button onClick={closeModal} variant='text' size='lg'>
								{t('profileSettings.cancel')}
							</Button>
							<Button size='lg'>{t('profileSettings.update')}</Button>
						</div>
					</form>
				</Form>
			) : (
				<div className='space-y-4 flex flex-col items-start'>
					<Button onClick={openModal} size='lg'>
						{t('profileSettings.update_password')}
					</Button>
					<div className='space-y-2'>
						<p className='cant-remember'>{t('profileSettings.cant_remember_password')}</p>
						<Button variant='secondary'>{t('profileSettings.reset_password_by_email')}</Button>
					</div>
				</div>
			)}
		</div>
	);
}
