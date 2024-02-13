import { Button } from '@/components/Button';
import { DrawerClose, DrawerFooter } from '@/components/Drawer';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { Separator } from '@/components/Separator';
import { Switch } from '@/components/Switch';
import { CreateTaskSchema } from '@/types';
import { describeCronExpression, translate as t } from '@/utils';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';

export default function TaskForm({ loading }: { loading?: boolean }) {
	const form = useFormContext<z.infer<typeof CreateTaskSchema>>();

	return (
		<div className='space-y-6'>
			<FormField
				control={form.control}
				name='name'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('general.name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(form.formState.errors.name)}
								placeholder={
									t('forms.placeholder', {
										label: t('general.name'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>
						<FormDescription>{t('forms.max64.description')}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='cronExpression'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('task.syntax')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(form.formState.errors.cronExpression)}
								placeholder={
									t('forms.placeholder', {
										label: t('task.syntax'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>
						<div className='space-x-'>
							<FormDescription>{t('task.syntax_description')}</FormDescription>

							<div className='space-y-1 text-xs'>
								<div className='flex items-center space-x-2 mt-4'>
									<p className='text-default'>*</p>
									<p className='text-subtle'>
										any value (e.g. <span className='text-default'>*</span>)
									</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>,</p>
									<p className='text-subtle'>
										value list separator (e.g. <span className='text-default'>1,5</span>)
									</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>-</p>
									<p className='text-subtle'>
										range of values (e.g. <span className='text-default'>1-5</span>)
									</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>/</p>
									<p className='text-subtle'>
										step values (e.g. <span className='text-default'>*/2</span>)
									</p>
								</div>
							</div>

							<Separator className='my-4' />
							<div className='space-y-1 text-xs'>
								<div className='flex items-center space-x-2 mt-4'>
									<p className='text-default'>0 0 * * 1-5</p>
									<p className='text-subtle'>{describeCronExpression('0 0 * * 1-5')}</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>1-59/2 * * * *</p>
									<p className='text-subtle'>{describeCronExpression('1-59/2 * * * *')}</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>0 0 * * *</p>
									<p className='text-subtle'>{describeCronExpression('0 0 * * *')}</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>*/30 * 1,5 * *</p>
									<p className='text-subtle'>{describeCronExpression('*/30 1,5 * * *')}</p>
								</div>
								<div className='flex items-center space-x-2'>
									<p className='text-default'>0 0 * * WED</p>
									<p className='text-subtle'>{describeCronExpression('0 0 * * WED')}</p>
								</div>
							</div>
						</div>
						<FormMessage />
						<Separator className='my-4' />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name='enabled'
				render={({ field }) => (
					<FormItem className='flex justify-between gap-4 items-center space-y-0'>
						<FormLabel>
							<p>{t('general.enabled')}</p>
							<p className='text-subtle'>{t('task.enabledDesc')}</p>
						</FormLabel>

						<FormControl>
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name='logExecution'
				render={({ field }) => (
					<FormItem className='flex justify-between gap-4 items-center space-y-0'>
						<FormLabel>
							<p>{t('task.logExec')}</p>
							<p className='text-subtle'>{t('task.logExecDesc')}</p>
						</FormLabel>

						<FormControl>
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
					</FormItem>
				)}
			/>

			<DrawerFooter className='mt-8'>
				<div className='flex justify-end'>
					<DrawerClose asChild>
						<Button variant='secondary' size='lg'>
							{t('general.cancel')}
						</Button>
					</DrawerClose>
					<Button className='ml-2' type='submit' size='lg' loading={loading}>
						{t('general.save')}
					</Button>
				</div>
			</DrawerFooter>
		</div>
	);
}
