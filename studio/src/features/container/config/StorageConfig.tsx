import {
	FormControl,
	FormField,
	FormFieldGroup,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Switch } from '@/components/Switch';
import { CreateContainerParams } from '@/types/container';
import { Package } from '@phosphor-icons/react';
import { startCase } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import MultiSelect, { OptionProps, components } from 'react-select';
import ContainerFormTitle from './ContainerFormTitle';

interface StateOption {
	readonly value: string;
	readonly label: string;
}

const accessModesOptions: StateOption[] = [
	{ value: 'ReadWriteOnce', label: 'ReadWriteOnce' },
	{ value: 'ReadOnlyMany', label: 'ReadOnlyMany' },
	{ value: 'ReadWriteMany', label: 'ReadWriteMany' },
];

export default function StorageConfig() {
	const { t } = useTranslation();
	const form = useFormContext<CreateContainerParams>();
	return (
		<div className='space-y-6'>
			<div className='flex justify-between'>
				<ContainerFormTitle
					title={t('container.storage.title')}
					description={t('container.storage.description') ?? ''}
				>
					<Package size={20} />
				</ContainerFormTitle>

				<FormField
					control={form.control}
					name='storageConfig.enabled'
					render={({ field }) => (
						<FormItem className='flex justify-between gap-4 items-center space-y-0'>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
			<div className='space-y-6 pl-12'>
				{form.watch('storageConfig.enabled') && (
					<div className='grid grid-cols-2 gap-4'>
						<FormField
							control={form.control}
							name='storageConfig.mountPath'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('container.storage.mount_path')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.storageConfig?.mountPath)}
											type='number'
											placeholder={
												t('forms.placeholder', {
													label: t('container.storage.mount_path'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormFieldGroup label={t('container.storage.storage_size') ?? ''}>
							<FormField
								control={form.control}
								name='storageConfig.size'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormControl>
											<Input
												className='rounded-r-none'
												error={Boolean(form.formState.errors.storageConfig?.size)}
												type='number'
												placeholder={
													t('forms.placeholder', {
														label: t('container.storage.storage_size'),
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
								name='storageConfig.sizeType'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormControl>
											<Select
												defaultValue={field.value}
												value={field.value}
												onValueChange={field.onChange}
											>
												<FormControl>
													<SelectTrigger
														className='w-full rounded-l-none'
														error={Boolean(form.formState.errors.storageConfig?.sizeType)}
													>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{['mebibyte', 'gibibyte']?.map((type) => (
														<SelectItem key={type} value={type} className='max-w-full'>
															{startCase(type)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</FormFieldGroup>
						<FormField
							control={form.control}
							name='storageConfig.reclaimPolicy'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('container.storage.reclaim')}</FormLabel>
									<Select
										defaultValue={field.value}
										value={field.value}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger className='w-full'>
												<SelectValue>{startCase(field.value)}</SelectValue>
											</SelectTrigger>
										</FormControl>
										<SelectContent className='max-w-full'>
											<div className='space-y-2'>
												{['retain', 'delete'].map((policy) => (
													<SelectItem key={policy} value={policy}>
														{startCase(policy)}
														<p className='text-xs text-subtle text-pretty max-w-[90ch]'>
															{t(`container.storage.${policy}`)}
														</p>
													</SelectItem>
												))}
											</div>
										</SelectContent>
									</Select>

									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='storageConfig.accessModes'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('container.storage.accessModes')}</FormLabel>
									<MultiSelect
										isMulti
										components={{ Option }}
										options={accessModesOptions}
										className='select-container'
										classNamePrefix='select'
										//@ts-ignore
										defaultValue={field.value?.map((value) =>
											accessModesOptions.find((option) => option.value === value),
										)}
										onChange={(selected) => field.onChange(selected.map((s) => s.value))}
										styles={{
											multiValueLabel: (base) => ({
												...base,
												color: 'white',
											}),
										}}
									/>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

const Option = (props: OptionProps<StateOption>) => {
	const { t } = useTranslation();
	return (
		<div>
			<components.Option {...props}>
				{props.label}
				<p className='text-xs text-subtle text-pretty max-w-[90ch]'>
					{t(`container.storage.${props.label}`)}
				</p>
			</components.Option>
		</div>
	);
};
