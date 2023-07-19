import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { cn, translate } from '@/utils';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from 'components/Input';
import { FormEvent, useEffect } from 'react';
import { Separator } from 'components/Separator';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from 'components/Select';
import { DATABASE_ICON_MAP } from '@/constants';
import { Button } from 'components/Button';
import useResourceStore from '@/store/resources/resourceStore.ts';
import { Plus } from '@phosphor-icons/react';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError } from '@/types';

interface CreateDatabaseDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
}
const nameSchema = z
	.string({
		required_error: translate('forms.required', {
			label: translate('general.name'),
		}),
	})
	.min(2, translate('forms.min2.error', { label: translate('general.name') }))
	.max(64, translate('forms.max64.error', { label: translate('general.name') }))
	.regex(/^[a-zA-Z0-9_]*$/, {
		message: translate('forms.alphanumeric', { label: translate('general.name') }),
	})
	.trim()
	.refine(
		(value) => value.trim().length > 0,
		translate('forms.required', {
			label: translate('general.name'),
		}),
	);
const CreateSchema = z.object({
	name: nameSchema,
	resourceId: z
		.string({
			required_error: translate('forms.required', {
				label: translate('database.add.resource.field'),
			}),
		})
		.refine((value) => useResourceStore.getState().resources.some((item) => item._id === value), {
			message: translate('forms.invalid', {
				label: translate('database.add.resource.field'),
			}),
		}),
	managed: z.boolean(),
});

export default function CreateAndEditDatabaseDrawer({
	open,
	onOpenChange,
	editMode,
}: CreateDatabaseDrawerProps) {
	const { t } = useTranslation();
	const { version } = useVersionStore();
	const { createDatabase, toEditDatabase, updateDatabaseName } = useDatabaseStore();
	const resources = useResourceStore((state) =>
		state.resources.filter((resource) => resource.type === 'database'),
	);
	const { toggleCreateResourceModal } = useResourceStore();
	const form = useForm<z.infer<typeof CreateSchema>>({
		resolver: zodResolver(CreateSchema),
		defaultValues: {
			managed: true,
		},
	});

	useEffect(() => {
		if (!open || !editMode || !toEditDatabase) return;
		form.setValue('name', toEditDatabase.name);
		form.setValue('managed', toEditDatabase.managed);
		// resource id is not editable, and its value is not changed when editing
		form.setValue('resourceId', useResourceStore.getState().resources[0]._id);
	}, [open, editMode, toEditDatabase]);

	async function onSubmit(data: z.infer<typeof CreateSchema>) {
		const resource = resources.find((item) => item._id === data.resourceId);
		if (!version || !resource) return;
		try {
			if (editMode) {
				if (!toEditDatabase) return;
				await updateDatabaseName({
					orgId: version.orgId,
					versionId: version._id,
					appId: version.appId,
					name: data.name,
					dbId: toEditDatabase?._id,
				});
			} else {
				await createDatabase({
					orgId: version.orgId,
					versionId: version._id,
					appId: version.appId,
					managed: data.managed,
					type: resource.instance,
					resourceId: data.resourceId,
					name: data.name,
				});
			}
			openStatusChange(false);
			form.reset();
		} catch (e) {
			const error = e as APIError;
			error.fields?.forEach((field) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				form.setError(field.param, {
					message: field.msg,
				});
			});
		}
	}

	function formHandler(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		form.handleSubmit(onSubmit)(event);
	}

	function openStatusChange(status: boolean) {
		onOpenChange(status);
		if (!status) form.reset();
	}

	return (
		<Drawer open={open} onOpenChange={openStatusChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='relative'>
					<DrawerTitle>{editMode ? t('database.edit.title') : t('database.add.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					<Form {...form}>
						<form className='space-y-6' onSubmit={formHandler}>
							<FormField
								control={form.control}
								name='name'
								render={({ field, formState: { errors } }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('database.add.field')}</FormLabel>
										<FormControl>
											<Input
												error={Boolean(errors.name)}
												type='text'
												placeholder={
													t('forms.placeholder', {
														label: t('database.add.field').toLowerCase(),
													}) as string
												}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('forms.max64.description')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{!editMode && (
								<>
									<Separator />
									<FormField
										control={form.control}
										name='resourceId'
										render={({ field, formState: { errors } }) => (
											<FormItem className='space-y-1'>
												<FormLabel>{t('database.add.resource.field')}</FormLabel>
												<FormControl>
													<Select
														defaultValue={field.value}
														value={field.value}
														name={field.name}
														onValueChange={field.onChange}
													>
														<FormControl>
															<SelectTrigger
																className={cn('w-full input', errors.resourceId && 'input-error')}
															>
																<SelectValue
																	className={cn('text-subtle')}
																	placeholder={t('database.add.resource.placeholder')}
																/>
															</SelectTrigger>
														</FormControl>
														<SelectContent align='center'>
															<Button
																size='full'
																onClick={toggleCreateResourceModal}
																variant='blank'
																className='gap-2 px-3 !no-underline text-button-primary font-normal text-left justify-start hover:bg-subtle'
															>
																<Plus weight='bold' size={16} />
																{t('database.add.resource.add')}
															</Button>
															<SelectSeparator />
															{resources.map((resource) => {
																const Icon = DATABASE_ICON_MAP[resource.instance];
																return (
																	<SelectItem
																		checkClassName='right-2 left-auto top-1/2 -translate-y-1/2'
																		className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																		key={resource._id}
																		value={resource._id}
																	>
																		<div className='flex items-center gap-2'>
																			<Icon />
																			{resource.name}
																		</div>
																	</SelectItem>
																);
															})}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}

							<div className='flex justify-end'>
								<Button size='lg'>{editMode ? t('general.save') : t('general.create')}</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
