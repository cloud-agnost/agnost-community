import { Button } from '@/components/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useUtilsStore from '@/store/version/utilsStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gear } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
const TestSettingsSchema = z.object({
	accessToken: z.string().optional(),
	sessionToken: z.string().optional(),
});

export default function TestEndpointSettings({ ctx }: { ctx: any }) {
	const { t } = useTranslation();
	const { tokens } = useEndpointStore();
	const { clearEndpointsRequestHeaders } = useUtilsStore();
	const form = useForm<z.infer<typeof TestSettingsSchema>>({
		resolver: zodResolver(TestSettingsSchema),
		defaultValues: {
			accessToken: tokens.accessToken,
			sessionToken: tokens.sessionToken,
		},
	});
	const { setTokens } = useEndpointStore();
	const onSubmit = form.handleSubmit((data) => {
		setTokens(data);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	});

	function handleApplyToAllEndpoints() {
		const headers = ctx.getValues('headers')?.map((h: any) => {
			if (h.key === 'Authorization' || h.key === 'Session') h.value = '';
			return h;
		});
		clearEndpointsRequestHeaders();
		ctx.setValue('headers', headers);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='icon' size='sm' rounded>
					<Gear className='w-4 h-4' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80 p-4' align='end'>
				<Form {...form}>
					<form onSubmit={onSubmit} className='space-y-6'>
						<FormField
							control={form.control}
							name='accessToken'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('general.accessToken')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.accessToken)}
											placeholder={
												t('forms.placeholder', {
													label: t('general.name'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='sessionToken'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('general.session_token')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.sessionToken)}
											placeholder={
												t('forms.placeholder', {
													label: t('general.name'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex items-center justify-end gap-2 border-t border-border'>
							<Button type='submit' variant='primary'>
								{t('general.save')}
							</Button>
							<Button type='submit' variant='primary' onClick={handleApplyToAllEndpoints}>
								Apply to All Endpoints
							</Button>
						</div>
					</form>
				</Form>
			</PopoverContent>
		</Popover>
	);
}
