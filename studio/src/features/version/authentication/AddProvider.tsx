import { Button } from '@/components/Button';
import { CopyInput } from '@/components/CopyInput';
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/Drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input, Textarea } from '@/components/Input';
import { Separator } from '@/components/Separator';
import { OAUTH_URL_MAP } from '@/constants';
import { useToast } from '@/hooks';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError, OAuthProvider, OAuthProviderTypes, VersionOAuthProvider } from '@/types';
import { capitalize, isEmpty, translate as t } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import * as z from 'zod';

interface AddProviderProps {
	open: boolean;
	onClose: () => void;
	provider: OAuthProvider;
	editedProvider?: VersionOAuthProvider;
}

const AddOAuthProviderSchema = z
	.object({
		provider: z.nativeEnum(OAuthProviderTypes),
		config: z.object({
			key: z.string().optional(),
			secret: z.string().optional(),
			teamId: z.string().optional(),
			serviceId: z.string().optional(),
			keyId: z.string().optional(),
			privateKey: z.string().optional(),
		}),
	})
	.superRefine((data, ctx) => {
		const { config, provider } = data;
		if (provider === OAuthProviderTypes.Apple) {
			if (!config.teamId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.teamId'),
					}),
					path: ['config', 'teamId'],
				});
			}
			if (!config.serviceId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.serviceId'),
					}),
					path: ['config', 'serviceId'],
				});
			}
			if (!config.keyId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.keyId'),
					}),
					path: ['config', 'keyId'],
				});
			}
		} else {
			if (!config.key) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.key'),
					}),
					path: ['config', 'key'],
				});
			}
			if (!config.secret) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.secret'),
					}),
					path: ['config', 'secret'],
				});
			}
		}
	});

export default function AddProvider({ open, onClose, provider, editedProvider }: AddProviderProps) {
	const { notify } = useToast();
	const { environment } = useEnvironmentStore();
	const { version, createOAuthConfig, updateOAuthConfig } = useVersionStore();
	const form = useForm<z.infer<typeof AddOAuthProviderSchema>>({
		resolver: zodResolver(AddOAuthProviderSchema),
		defaultValues: {
			provider: provider.provider,
			config: {
				key: '',
				secret: '',
				teamId: '',
				serviceId: '',
				keyId: '',
				privateKey: '',
			},
		},
	});

	function onSubmit(data: z.infer<typeof AddOAuthProviderSchema>) {
		const req = {
			orgId: version?.orgId,
			versionId: version?._id,
			appId: version?.appId,
			onSuccess: () => {
				handleCloseModel();
			},
			onError: (error: APIError) => {
				notify({
					type: 'error',
					title: t('general.error'),
					description: error.details,
				});
			},
		};

		if (!isEmpty(editedProvider)) {
			updateOAuthConfig({
				providerId: editedProvider?._id as string,
				key: data.config.key as string,
				secret: data.config.secret as string,
				...req,
			});
		} else {
			createOAuthConfig({
				...data,
				...req,
			});
		}
	}

	function handleCloseModel() {
		form.reset({
			provider: '' as OAuthProviderTypes,
			config: {
				key: '',
				secret: '',
				teamId: '',
				serviceId: '',
				keyId: '',
				privateKey: '',
			},
		});
		onClose();
	}
	const callbackUrl = `${window.location.origin}/${environment?.iid}/oauth/${provider.provider}/callback`;

	useEffect(() => {
		if (open && provider) {
			form.setValue('provider', provider.provider);
		}
	}, [provider]);

	useEffect(() => {
		if (editedProvider) {
			form.reset(editedProvider);
		}
	}, [editedProvider]);

	return (
		<Drawer open={open} onOpenChange={handleCloseModel}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>
						{t('version.authentication.add_provider_title', {
							provider: capitalize(provider.provider),
						})}
					</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							{provider.provider && (
								<p className='text-sm text-subtle font-sfCompact'>
									<Trans
										i18nKey='version.authentication.oAuth_provider_desc'
										components={{
											platform: (
												<Link
													to={OAUTH_URL_MAP[provider.provider]}
													className='link'
													target='_blank'
													rel='noopener noreferrer'
												/>
											),
										}}
										values={{
											provider: capitalize(provider.provider),
											platform: t(`version.authentication.${provider.provider}`),
											params: provider?.params?.map((param) => param.title).join(', '),
										}}
									/>
								</p>
							)}
							{provider.params?.map((param) => (
								<FormField
									key={param.name}
									control={form.control}
									name={`config.${param.name}`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>{param.title}</FormLabel>
											<FormControl>
												{param.multiline ? (
													<Textarea
														error={Boolean(form.formState.errors.config?.[param.name])}
														placeholder={
															t('forms.placeholder', {
																label: param.title,
															}) ?? ''
														}
														{...field}
													/>
												) : (
													<Input
														error={Boolean(form.formState.errors.config?.[param.name])}
														placeholder={
															t('forms.placeholder', {
																label: param.title,
															}) ?? ''
														}
														{...field}
													/>
												)}
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
							<Separator />

							<h4 className='text-sm text-default font-sfCompact'>
								{t('version.authentication.callback_url')}
							</h4>
							<p className='text-sm text-subtle font-sfCompact'>
								{t('version.authentication.callback_url_desc', {
									provider: capitalize(provider.provider),
								})}
							</p>

							<CopyInput readOnly value={callbackUrl} />

							<DrawerFooter>
								<Button type='submit' variant='primary' size='lg'>
									{t('general.add')}
								</Button>
							</DrawerFooter>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
