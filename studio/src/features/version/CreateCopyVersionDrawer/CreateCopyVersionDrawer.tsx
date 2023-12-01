import { Button } from '@/components/Button';
import { useToast } from '@/hooks';
import useVersionStore from '@/store/version/versionStore.ts';
import { translate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Input } from 'components/Input';
import { Switch } from 'components/Switch';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import './CreateCopyVersionDrawer.scss';
import { useMutation } from '@tanstack/react-query';
import { APIError } from '@/types';
const CreateCopyVersionForm = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.name'),
			}),
		})
		.min(2, translate('forms.min2.error', { label: translate('general.name') }))
		.max(64, translate('forms.max64.error', { label: translate('general.name') }))
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.name'),
			}),
		),
	private: z.boolean(),
	readOnly: z.boolean(),
});

export default function CreateCopyVersionDrawer() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const {
		createCopyVersionDrawerIsOpen,
		createCopyOfVersion,
		setCreateCopyVersionDrawerIsOpen,
		version,
		selectVersion,
	} = useVersionStore();

	useEffect(() => {
		if (!createCopyVersionDrawerIsOpen) form.reset();
	}, [createCopyVersionDrawerIsOpen]);

	const form = useForm<z.infer<typeof CreateCopyVersionForm>>({
		resolver: zodResolver(CreateCopyVersionForm),
		defaultValues: {
			name: '',
			private: false,
			readOnly: false,
		},
	});

	const { mutateAsync: copyMutate, isPending } = useMutation({
		mutationFn: createCopyOfVersion,
		mutationKey: ['createCopyOfVersion'],
		onSuccess: (version) => {
			notify({
				type: 'success',
				title: translate('general.success'),
				description: translate('version.copied'),
			});
			selectVersion(version);
		},
		onError: (error: APIError) => {
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		},
	});
	async function onSubmit(data: z.infer<typeof CreateCopyVersionForm>) {
		copyMutate({
			orgId: version.orgId,
			appId: version.appId,
			parentVersionId: version._id,
			...data,
		});
	}

	function onClose() {
		form.reset();
		setCreateCopyVersionDrawerIsOpen(false);
	}

	return (
		<Drawer open={createCopyVersionDrawerIsOpen} onOpenChange={onClose}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.create_copy_of_version')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6 flex flex-col gap-6' onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('version.name')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.name)}
											placeholder={
												t('forms.placeholder', {
													label: t('version.name').toLowerCase(),
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
							name='private'
							render={({ field }) => (
								<FormItem className='grid grid-cols-[2fr_1fr] items-center space-y-0 gap-2'>
									<div>
										<FormLabel>{t('version.private')}</FormLabel>
										<FormDescription>{t('version.settings.private_desc')}</FormDescription>
									</div>
									<FormControl className='justify-self-end'>
										<Switch
											onBlur={field.onBlur}
											ref={field.ref}
											name={field.name}
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='readOnly'
							render={({ field }) => (
								<FormItem className='grid grid-cols-[2fr_1fr] items-center space-y-0 gap-2'>
									<div>
										<FormLabel>{t('version.read_only')}</FormLabel>
										<FormDescription>{t('version.settings.read_only_desc')}</FormDescription>
									</div>
									<FormControl className='justify-self-end'>
										<Switch
											onBlur={field.onBlur}
											ref={field.ref}
											name={field.name}
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end mt-4'>
							<Button loading={isPending} size='lg'>
								{t('general.add')}
							</Button>
						</div>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
