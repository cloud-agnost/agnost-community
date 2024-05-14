import { GitBranch } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import ContainerFormTitle from './ContainerFormTitle';
import {
	FormField,
	FormItem,
	FormLabel,
	FormDescription,
	FormControl,
	FormMessage,
	FormFieldGroup,
} from '@/components/Form';
import { Switch } from '@/components/Switch';
import { CreateContainerParams } from '@/types/container';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/Input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/Select/Select';
import { startCase } from 'lodash';
export default function AutoScaleConfig() {
	const { t } = useTranslation();
	const form = useFormContext<CreateContainerParams>();
	return (
		<div className='space-y-6'>
			<ContainerFormTitle
				title={t('container.autoscale.title')}
				description={t('container.autoscale.description') ?? ''}
			>
				<GitBranch size={20} />
			</ContainerFormTitle>
			<div className='grid grid-cols-2 gap-8'>
				<div className='space-y-6'>
					<FormField
						control={form.control}
						name='deploymentConfig.cpuMetric.enabled'
						render={({ field }) => (
							<FormItem className='flex justify-between gap-4 items-center space-y-0'>
								<FormLabel>{t('container.autoscale.cpu_metric')}</FormLabel>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormFieldGroup>
						<FormField
							control={form.control}
							name='deploymentConfig.cpuMetric.metricValue'
							disabled={!form.watch('deploymentConfig.cpuMetric.enabled')}
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormControl>
										<Input
											disabled={!form.watch('deploymentConfig.cpuMetric.enabled')}
											className='rounded-r-none'
											error={Boolean(
												form.formState.errors.deploymentConfig?.cpuMetric?.metricValue,
											)}
											type='number'
											placeholder={
												t('forms.placeholder', {
													label: t('container.autoscale.cpu_metric'),
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
							name='deploymentConfig.cpuMetric.metricType'
							disabled={!form.watch('deploymentConfig.cpuMetric.enabled')}
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormControl>
										<Select
											defaultValue={field.value}
											value={field.value}
											onValueChange={field.onChange}
											disabled={!form.watch('deploymentConfig.cpuMetric.enabled')}
										>
											<FormControl>
												<SelectTrigger
													className='w-full rounded-l-none'
													error={Boolean(
														form.formState.errors.deploymentConfig?.cpuMetric?.metricType,
													)}
												>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{['AverageUtilization', 'AverageValueMillicores', 'AverageValueCores']?.map(
													(type) => (
														<SelectItem key={type} value={type} className='max-w-full'>
															{startCase(type)}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</FormFieldGroup>
				</div>
				<div className='space-y-6'>
					<FormField
						control={form.control}
						name='deploymentConfig.memoryMetric.enabled'
						render={({ field }) => (
							<FormItem className='flex justify-between gap-4 items-center space-y-0'>
								<FormLabel>{t('container.autoscale.memory_metric')}</FormLabel>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>
					<FormFieldGroup>
						<FormField
							control={form.control}
							name='deploymentConfig.memoryMetric.metricValue'
							disabled={!form.watch('deploymentConfig.memoryMetric.enabled')}
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormControl>
										<Input
											disabled={!form.watch('deploymentConfig.memoryMetric.enabled')}
											className='rounded-r-none'
											error={Boolean(
												form.formState.errors.deploymentConfig?.memoryMetric?.metricValue,
											)}
											type='number'
											placeholder={
												t('forms.placeholder', {
													label: t('container.autoscale.cpu_metric'),
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
							name='deploymentConfig.memoryMetric.metricType'
							disabled={!form.watch('deploymentConfig.memoryMetric.enabled')}
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormControl>
										<Select
											defaultValue={field.value}
											value={field.value}
											onValueChange={field.onChange}
											disabled={!form.watch('deploymentConfig.memoryMetric.enabled')}
										>
											<FormControl>
												<SelectTrigger
													className='w-full rounded-l-none'
													error={Boolean(
														form.formState.errors.deploymentConfig?.memoryMetric?.metricType,
													)}
												>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{['AverageValueMillicores', 'AverageValueCores']?.map((type) => (
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
				</div>
			</div>
		</div>
	);
}
