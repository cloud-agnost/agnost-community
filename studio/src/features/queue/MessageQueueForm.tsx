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
import { Switch } from '@/components/Switch';
import { CreateMessageQueueSchema } from '@/types';
import { translate as t } from '@/utils';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
export default function MessageQueueForm() {
	const form = useFormContext<z.infer<typeof CreateMessageQueueSchema>>();
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
				name='delay'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('queue.create.delay')}</FormLabel>
						<FormControl>
							<Input
								type='number'
								error={Boolean(form.formState.errors.delay)}
								placeholder={
									t('forms.placeholder', {
										label: t('queue.create.delay'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>
						<FormDescription>{t('queue.create.delay_description')}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='logExecution'
				render={({ field }) => (
					<FormItem className='flex justify-between gap-4 items-center space-y-0'>
						<FormLabel>
							<p>{t('queue.create.logExec')}</p>
							<p className='text-subtle'>{t('queue.create.logExecDescription')}</p>
						</FormLabel>

						<FormControl>
							<Switch checked={field.value} onCheckedChange={field.onChange} />
						</FormControl>
					</FormItem>
				)}
			/>

			<DrawerFooter className='mt-8'>
				<div className='flex justify-end'>
					<DrawerClose>
						<Button variant='secondary' size='lg'>
							{t('general.cancel')}
						</Button>
					</DrawerClose>
					<Button className='ml-2' type='submit' size='lg'>
						{t('general.save')}
					</Button>
				</div>
			</DrawerFooter>
		</div>
	);
}
