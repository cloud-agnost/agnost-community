import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { DrawerFooter } from '@/components/Drawer';
import { Input } from '@/components/Input';
import { INSTANCE_PORT_MAP } from '@/constants';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useResourceStore from '@/store/resources/resourceStore';
import useTypeStore from '@/store/types/typeStore';
import { Instance } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CreateResourceItem from '../CreateResourceItem';
import ResourceInstance from '../ResourceType/ResourceInstance';
interface Props {
	title: string;
	children: React.ReactNode;
	actions?: React.ReactNode;
	instances?: Instance[];
	control?: Control<any>;
	typeSelection?: boolean;
	loading?: boolean;
}
export default function CreateResourceLayout({
	title,
	children,
	actions,
	instances,
	control,
	typeSelection,
	loading,
}: Props) {
	const { t } = useTranslation();
	const { resourceType, returnToPreviousStep, goToNextStep } = useResourceStore();
	const { appRoles } = useTypeStore();
	const canCreateResource = useAuthorizeOrg('resource.create');
	const form = useFormContext();

	return (
		<div className='px-6 py-4 space-y-6  overflow-auto'>
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
														className='flex flex-row items-start space-x-4 space-y-0'
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
					{instances?.length && (
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
													form.setValue('access.port', INSTANCE_PORT_MAP[type.name]);
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
					)}
				</>
			)}
			{children}
			{typeSelection ? (
				<DrawerFooter>
					<Button
						variant='primary'
						size='lg'
						onClick={goToNextStep}
						disabled={!(resourceType.type && resourceType.name)}
					>
						{t('general.next')}
					</Button>
				</DrawerFooter>
			) : (
				<DrawerFooter className='justify-between'>
					{actions}
					<div className='flex items-center justify-center gap-4'>
						<Button size='lg' type='button' variant='secondary' onClick={returnToPreviousStep}>
							{t('general.previous')}
						</Button>
						<Button size='lg' type='submit' loading={loading} disabled={!canCreateResource}>
							{t('general.add')}
						</Button>
					</div>
				</DrawerFooter>
			)}
		</div>
	);
}
