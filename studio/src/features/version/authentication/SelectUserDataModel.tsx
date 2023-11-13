import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { DATABASE_ICON_MAP, FIELD_ICON_MAP } from '@/constants';
import { useToast } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError } from '@/types';
import { cn, isEmpty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from '@phosphor-icons/react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { translate as t } from '@/utils';
import useSettingsStore from '@/store/version/settingsStore';

const SaveUserModelSchema = z.object({
	databaseId: z.string({
		required_error: t('forms.required', {
			label: t('resources.type.database'),
		}),
	}),
	modelId: z.string({
		required_error: t('forms.required', {
			label: t('version.authentication.model'),
		}),
	}),
});

export default function SelectUserDataModel() {
	const [error, setError] = useState<APIError>();
	const { saveUserDataModelInfo, addMissingUserDataModelFields } = useSettingsStore();
	const { version } = useVersionStore();
	const { databases, getDatabasesOfApp } = useDatabaseStore();
	const { models, getModelsOfDatabase } = useModelStore();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof SaveUserModelSchema>>({
		defaultValues: {
			databaseId: databases?.find(
				(db) => db.iid === version?.authentication?.userDataModel?.database,
			)?._id,
			modelId: models?.find((model) => model.iid === version?.authentication?.userDataModel?.model)
				?._id,
		},
		resolver: zodResolver(SaveUserModelSchema),
	});

	useEffect(() => {
		if (version && isEmpty(databases)) {
			getDatabasesOfApp({
				orgId: version.orgId,
				versionId: version._id,
				appId: version.appId,
			});
		}
	}, []);
	function getDatabaseIcon(type: string): React.ReactNode {
		const Icon = DATABASE_ICON_MAP[type];
		return <Icon className='w-4 h-4' />;
	}
	function getFieldIcon(type: string): React.ReactNode {
		const Icon = FIELD_ICON_MAP[type];
		return <Icon className='w-6 h-6 text-elements-strong-red' />;
	}

	function onSubmit(data: z.infer<typeof SaveUserModelSchema>) {
		saveUserDataModelInfo({
			orgId: version?.orgId as string,
			versionId: version?._id as string,
			appId: version?.appId as string,
			...data,
			onSuccess: () => {
				notify({
					title: t('general.success'),
					description: t('version.authentication.user_data_model_saved'),
					type: 'success',
				});
			},
			onError: (error) => setError(error),
		});
	}
	function addMissingFields() {
		addMissingUserDataModelFields({
			orgId: version?.orgId as string,
			versionId: version?._id as string,
			appId: version?.appId as string,
			...form.getValues(),
			onSuccess: () => {
				notify({
					title: t('general.success'),
					description: t('version.authentication.added_missing_fields'),
					type: 'success',
				});
				setError(undefined);
			},
			onError: (error) => setError(error),
		});
	}

	return (
		<SettingsFormItem
			className='py-0'
			contentClassName='space-y-6'
			title={t('version.authentication.user_data_model')}
			description={t('version.authentication.user_data_model_desc')}
		>
			{!!error?.missingFields?.length && (
				<Alert variant='error'>
					<AlertTitle className=' text-elements-red'>{error?.error}</AlertTitle>
					<AlertDescription className='space-y-6'>
						<p className='text-elements-subtle-red'>{error?.details}</p>
						<div className='space-y-4'>
							{error?.missingFields?.map((field) => {
								return (
									<div key={field.name} className='space-y-2'>
										<div className='flex items-center gap-4'>
											{getFieldIcon(field.type)}
											<p className='text-elements-red font-sfCompact text-sm'>
												{field.name}{' '}
												<span className='text-elements-subtle-red'>({field.type})</span>
											</p>
										</div>
										<p className='text-elements-subtle-red'>
											{t(`version.authentication.${field.name}`)}
										</p>
									</div>
								);
							})}
						</div>
						<Button size='xl' onClick={addMissingFields}>
							<Plus weight='bold' className='mr-2' />
							{t('version.authentication.add_missing_fields')}
						</Button>
					</AlertDescription>
				</Alert>
			)}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='flex-1 flex flex-col gap-6'>
					<div className='flex items-center gap-4 flex-1'>
						<FormField
							control={form.control}
							name='databaseId'
							render={({ field, formState: { errors } }) => (
								<FormItem className='space-y-1 flex-1'>
									<FormLabel>{t('resources.type.database')}</FormLabel>
									<FormControl>
										<Select
											defaultValue={field.value}
											value={field.value}
											name={field.name}
											onValueChange={(value) => {
												if (version) {
													getModelsOfDatabase({
														orgId: version.orgId,
														versionId: version._id,
														appId: version.appId,
														dbId: value,
													});
												}
												field.onChange(value);
											}}
										>
											<FormControl>
												<SelectTrigger
													className={cn('w-full flex-1', errors.databaseId && 'input-error')}
												>
													<SelectValue
														className={cn('text-subtle')}
														placeholder={`${t('general.select')} ${t('resources.type.database')}`}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent align='center'>
												{databases.map((db) => {
													return (
														<SelectItem
															className='px-3 py-[6px] w-full max-w-full cursor-pointer'
															key={db._id}
															value={db._id}
														>
															<div className='flex items-center gap-2'>
																{getDatabaseIcon(db.type)}
																{db.name}
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
						<FormField
							control={form.control}
							name='modelId'
							render={({ field, formState: { errors } }) => (
								<FormItem className='space-y-1 flex-1'>
									<FormLabel>{t('version.authentication.model')}</FormLabel>
									<FormControl>
										<Select
											defaultValue={field.value}
											value={field.value}
											name={field.name}
											onValueChange={field.onChange}
										>
											<FormControl>
												<SelectTrigger
													className={cn('w-full input', errors.databaseId && 'input-error')}
												>
													<SelectValue
														className={cn('text-subtle')}
														placeholder={`${t('general.select')} ${t(
															'version.authentication.model',
														)}`}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent align='center'>
												{models.map((model) => {
													return (
														<SelectItem
															className='px-3 py-[6px] w-full max-w-full cursor-pointer'
															key={model._id}
															value={model._id}
														>
															<div className='flex items-center gap-2'>{model.name}</div>
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
					</div>
					<Button type='submit' className='ml-auto self-end' size='lg'>
						{t('general.save')}
					</Button>
				</form>
			</Form>
		</SettingsFormItem>
	);
}
