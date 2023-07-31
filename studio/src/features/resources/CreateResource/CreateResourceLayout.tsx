import { DrawerFooter } from '@/components/Drawer';
import { Input } from '@/components/Input';
import useResourceStore from '@/store/resources/resourceStore';
import { Instance } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CreateResourceItem from '../CreateResourceItem';
import ResourceInstance from '../ResourceType/ResourceInstance';
import useTypeStore from '@/store/types/typeStore';
import { Checkbox } from '@/components/Checkbox';
interface Props {
	title: string;
	children: React.ReactNode;
	actions: React.ReactNode;
	instances?: Instance[];
	control?: Control<any>;
	typeSelection?: boolean;
}
export default function CreateResourceLayout({
	title,
	children,
	actions,
	instances,
	control,
	typeSelection,
}: Props) {
	const { t } = useTranslation();
	const { resourceType } = useResourceStore();
	const { appRoles } = useTypeStore();

	return (
		<div className='px-6 py-4 space-y-6 max-h-[90%] overflow-auto'>
			<div className='font-sfCompact'>
				<p className='text-subtle text-sm'>
					{t('resources.step', {
						currentStep: resourceType.step,
					})}
				</p>
				<p className='text-default'>{title}</p>
			</div>
			{!typeSelection && (
				<>
					<CreateResourceItem title={t('resources.resource_name')}>
						<Controller
							control={control}
							name='instance'
							render={({ formState: { errors } }) => (
								<FormField
									control={control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t('general.name')}</FormLabel>
											<FormControl>
												<Input
													error={Boolean(errors.name)}
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
							)}
						/>
					</CreateResourceItem>
					<CreateResourceItem title={t('resources.table.allowedRoles')}>
						<Controller
							control={control}
							name='allowedRoles'
							render={({ field: { onChange, value } }) => (
								<FormItem className='flex items-center space-x-6 space-y-0'>
									{appRoles.map((role) => (
										<FormField
											key={role}
											control={control}
											name='allowedRoles'
											render={() => {
												return (
													<FormItem
														key={role}
														className='flex flex-row items-start space-x-3 space-y-0'
													>
														<FormControl>
															<Checkbox
																checked={value?.includes(role)}
																onCheckedChange={(checked) => {
																	if (checked) {
																		if (!value) {
																			onChange([role]);
																			return;
																		}
																		onChange([...value, role]);
																	} else {
																		onChange(value?.filter((r: string) => r !== role));
																	}
																}}
															/>
														</FormControl>
														<FormLabel className='text-sm font-normal'>{role}</FormLabel>
													</FormItem>
												);
											}}
										/>
									))}
									<FormMessage />
								</FormItem>
							)}
						/>
					</CreateResourceItem>
					<CreateResourceItem title={t('resources.database.choose_type')}>
						<Controller
							control={control}
							name='instance'
							render={({ field: { onChange, value }, formState: { errors } }) => (
								<div className='grid grid-cols-4 gap-4'>
									{instances?.map((type) => (
										<ResourceInstance
											key={type.id}
											instance={type}
											onSelect={() => {
												onChange(type.name);
											}}
											active={value === type.name}
										/>
									))}
									<p className='col-span-4 text-error-default text-sm font-sfCompact'>
										{errors.instance?.message?.toString()}
									</p>
								</div>
							)}
						/>
					</CreateResourceItem>
				</>
			)}
			{children}
			<DrawerFooter>{actions}</DrawerFooter>
		</div>
	);
}
