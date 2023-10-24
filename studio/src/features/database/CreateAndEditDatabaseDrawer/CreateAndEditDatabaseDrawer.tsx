import { ResourceSelect } from '@/components/ResourceSelect';
import { NAME_SCHEMA } from '@/constants';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useResourceStore from '@/store/resources/resourceStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { APIError, ResourceType } from '@/types';
import { capitalize, cn, translate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'components/Button';
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
import { Separator } from 'components/Separator';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { Switch } from 'components/Switch';
import { FormEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
interface CreateDatabaseDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
}

const CreateSchema = z.object({
	name: NAME_SCHEMA,
	assignUniqueName: z.boolean(),
	poolSize: z
		.number({
			invalid_type_error: translate('forms.required', {
				label: capitalize(translate('database.add.poolSize').toLowerCase()),
			}),
			required_error: translate('forms.required', {
				label: capitalize(translate('database.add.poolSize').toLowerCase()),
			}),
		})
		.min(1)
		.max(50),
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
	const getResources = useResourceStore((state) => state.getResources);
	const canCreateDatabase = useAuthorizeVersion('db.create');
	const resources = useResourceStore((state) =>
		state.resources.filter((resource) => resource.type === 'database'),
	);
	const form = useForm<z.infer<typeof CreateSchema>>({
		resolver: zodResolver(CreateSchema),
		defaultValues: {
			managed: true,
			assignUniqueName: true,
			poolSize: 1,
		},
	});

	useEffect(() => {
		if (!open || !version) return;
		getResources({
			type: 'database',
		});
	}, [open]);

	useEffect(() => {
		if (!open || !editMode || !toEditDatabase) return;
		form.setValue('name', toEditDatabase.name);
		form.setValue('managed', toEditDatabase.managed);
		// resource id is not editable, and its value is not changed when editing
		form.setValue('resourceId', useResourceStore.getState().resources[0]._id);
		form.setValue('assignUniqueName', toEditDatabase.assignUniqueName);
		form.setValue('poolSize', toEditDatabase.poolSize);
	}, [open, editMode, toEditDatabase]);

	async function onSubmit(data: z.infer<typeof CreateSchema>) {
		const resource = resources.find((item) => item._id === data.resourceId);
		if (!version || !resource) return;
		try {
			if (editMode) {
				if (!toEditDatabase || !toEditDatabase.assignUniqueName) return;
				await updateDatabaseName({
					orgId: version.orgId,
					versionId: version._id,
					appId: version.appId,
					poolSize: data.poolSize,
					name: data.name,
					dbId: toEditDatabase?._id,
				});
			} else {
				await createDatabase({
					orgId: version.orgId,
					versionId: version._id,
					appId: version.appId,
					managed: data.managed,
					poolSize: data.poolSize,
					type: resource.instance,
					resourceId: data.resourceId,
					name: data.name,
					assignUniqueName: data.assignUniqueName,
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
												disabled={editMode && !toEditDatabase?.assignUniqueName}
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

							<Separator />
							<FormField
								control={form.control}
								name='assignUniqueName'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormControl>
											<SettingsFormItem
												as='label'
												className='py-0 space-y-0'
												contentClassName='flex items-center justify-center'
												title={t('database.add.unique.title')}
												description={t('database.add.unique.desc')}
												twoColumns
											>
												<Switch
													disabled={editMode}
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</SettingsFormItem>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator />
							<div className={cn('grid', !editMode && 'grid-cols-2 gap-4')}>
								<FormField
									control={form.control}
									name='poolSize'
									render={({ field, formState: { errors } }) => (
										<FormItem className='space-y-1'>
											<FormLabel>{t('database.add.poolSize')}</FormLabel>
											<FormControl>
												<Input
													error={Boolean(errors.name)}
													type='number'
													placeholder={
														t('forms.placeholder', {
															label: t('database.add.poolSize').toLowerCase(),
														}) as string
													}
													{...field}
													onChange={undefined}
													onInput={(e) => field.onChange(e.currentTarget.valueAsNumber)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{!editMode && (
									<FormField
										control={form.control}
										name='resourceId'
										render={({ field }) => (
											<FormItem className='space-y-1'>
												<FormLabel>{t('database.add.resource.field')}</FormLabel>
												<ResourceSelect
													className='w-full'
													defaultValue={field.value}
													value={field.value}
													name={field.name}
													onValueChange={field.onChange}
													error={Boolean(form.formState.errors.resourceId)}
													type={ResourceType.Database}
												/>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>

							<div className='flex justify-end'>
								<Button
									size='lg'
									disabled={!canCreateDatabase || (editMode && !toEditDatabase?.assignUniqueName)}
								>
									{editMode ? t('general.save') : t('general.create')}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
