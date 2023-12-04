import { Button } from '@/components/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/Dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Textarea } from '@/components/Input';
import { ErrorPage } from '@/components/icons';
import { notify } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams, useRouteError } from 'react-router-dom';
import * as z from 'zod';
const ErrorScheme = z.object({
	description: z.string({
		required_error: 'Description is required',
	}),
});

export default function Error({ children }: { children: React.ReactNode }) {
	const { t } = useTranslation();
	const error = useRouteError() as Error;
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const form = useForm<z.infer<typeof ErrorScheme>>({
		resolver: zodResolver(ErrorScheme),
	});
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	console.error(error);
	function onSubmit(data: z.infer<typeof ErrorScheme>) {
		setLoading(true);
		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');
		const raw = JSON.stringify({
			...data,
			orgId,
			appId,
			versionId,
			baseUrl: window.location.origin,
			error: error?.stack,
		});
		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
		};
		fetch('https://agnost.c1-europe.altogic.com/error', requestOptions)
			.then((response) => response.text())
			.then(() => {
				setLoading(false);
				notify({
					title: 'Feedback sent',
					description: 'Thank you for your feedback',
					type: 'success',
				});
				closeModal();
			})
			.catch(() => setLoading(false));
	}

	function closeModal() {
		setIsOpen(false);
		form.reset();
	}

	return (
		<div className='w-full h-screen flex flex-col items-center justify-center'>
			<div className='flex flex-col items-center space-y-2'>
				<ErrorPage className='w-36 h-32' />
				<h2 className='text-default text-2xl font-semibold'>{t('general.internalServerError')}</h2>
				<p className='text-lg text-subtle font-sfCompact'>
					{t('general.internalServerErrorDescription')}
				</p>
			</div>

			<div className='flex items-center'>
				{children}
				<Button className='mt-8 ml-4' variant='secondary' onClick={() => setIsOpen(true)}>
					{t('general.messageUs')}
				</Button>
			</div>
			<Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
				<DialogContent>
					<DialogTitle>{t('organization.create-new')}</DialogTitle>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='organization-form'>
							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem className='application-form-item'>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												error={Boolean(form.formState.errors.description)}
												placeholder={t('forms.placeholder', {
													label: 'Description',
												}).toString()}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('forms.max64.description')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className='flex justify-end gap-4 mt-2'>
								<Button variant='text' type='button' size='lg' onClick={closeModal}>
									{t('general.cancel')}
								</Button>
								<Button variant='primary' size='lg' loading={loading}>
									{t('general.ok')}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
