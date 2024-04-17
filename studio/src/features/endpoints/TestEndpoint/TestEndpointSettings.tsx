import { Button } from '@/components/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { Switch } from '@/components/Switch';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gear } from '@phosphor-icons/react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/Select';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { useMemo } from 'react';
const TestSettingsSchema = z.object({
	accessToken: z.string().optional(),
	sessionToken: z.string().optional(),
});

export default function TestEndpointSettings({ ctx }: { ctx: any }) {
	const { t } = useTranslation();
	const endpoint = useEndpointStore((state) => state.endpoint);
	const { version } = useVersionStore();
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

	function clearTokens() {
		form.setValue('accessToken', '');
		form.setValue('sessionToken', '');
		setTokens({ accessToken: '', sessionToken: '' });
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}

	const apiKeys = useMemo(() => {
		return version.apiKeys.filter((key) => {
			const isExcluded = key.excludedEndpoints.includes(endpoint.iid);
			const isNotAllowed =
				key.allowedEndpoints.length > 0 && !key.allowedEndpoints.includes(endpoint.iid);
			return !isExcluded && (!isNotAllowed || key.allowedEndpoints.length === 0);
		});
	}, [version.apiKeys]);
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
						{apiKeys.length > 0 && (
							<FormField
								control={form.control}
								name='accessToken'
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('general.accessToken')}</FormLabel>
										<FormControl>
											<Select
												defaultValue={field.value}
												value={field.value}
												name={field.name}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger className='w-full'>
														<SelectValue placeholder={`${t('general.select')} `} />
													</SelectTrigger>
												</FormControl>
												<SelectContent align='center' className='!max-h-[26rem]'>
													{apiKeys.map((key) => (
														<SelectItem key={key.name} value={key.key}>
															{key.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<FormField
							control={form.control}
							name='sessionToken'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('general.session_token')}</FormLabel>
									<FormControl>
										<Input error={Boolean(form.formState.errors.sessionToken)} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex flex-col gap-6 items-end justify-end border-t border-border'>
							<div className='flex items-center space-x-2'>
								<Label htmlFor='apply-all'>Apply to All Endpoints</Label>
								<Switch id='apply-all' onChange={handleApplyToAllEndpoints} />
							</div>
							<div className='flex gap-2'>
								<Button type='submit' variant='primary'>
									{t('general.save')}
								</Button>
								<Button type='button' variant='secondary' onClick={clearTokens}>
									Clear
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</PopoverContent>
		</Popover>
	);
}
