import { Badge } from '@/components/Badge';
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
import { Label } from '@/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Separator } from '@/components/Separator';
import { Switch } from '@/components/Switch';
import { ALL_HTTP_METHODS, BADGE_COLOR_MAP } from '@/constants';
import useVersionStore from '@/store/version/versionStore';
import { CreateEndpointSchema, RateLimit } from '@/types';
import { cn, reorder, translate as t } from '@/utils';
import { DropResult } from 'react-beautiful-dnd';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { SortableRateLimits } from '../version/SettingsGeneral';
import EndpointMiddlewares from './EndpointMiddlewares';

export default function EndpointForm() {
	const form = useFormContext<z.infer<typeof CreateEndpointSchema>>();
	const rateLimits = useVersionStore((state) => state.version?.limits);
	return (
		<>
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
				name='timeout'
				render={({ field }) => (
					<FormItem className='mt-6'>
						<FormLabel>{t('endpoint.create.timeout')}</FormLabel>
						<FormControl>
							<Input
								type='number'
								error={Boolean(form.formState.errors.timeout)}
								placeholder={
									t('forms.placeholder', {
										label: t('endpoint.create.timeout'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<Separator className='my-6' />
			<Label
				className={cn(
					(Boolean(form.formState.errors.method) || Boolean(form.formState.errors.path)) &&
						'text-error-default',
				)}
			>
				{t('endpoint.create.methodAndPath')}
			</Label>
			<div className='flex  rounded mt-3 mb-6'>
				<FormField
					control={form.control}
					name='method'
					render={({ field }) => (
						<FormItem>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger
										className='w-[117px] bg-input-background rounded-none rounded-l'
										error={Boolean(form.formState.errors.method)}
									>
										<SelectValue placeholder='Select a role' className='flex-1'>
											<Badge
												className='w-3/4'
												variant={BADGE_COLOR_MAP[field.value]}
												text={field.value}
											/>
										</SelectValue>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{ALL_HTTP_METHODS.map((role) => (
										<SelectItem key={role} value={role}>
											{role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='path'
					render={({ field }) => (
						<FormItem className='w-full'>
							<FormControl>
								<Input
									className='rounded-none rounded-r '
									error={Boolean(form.formState.errors.path)}
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
			</div>
			<div className='space-y-4'>
				<FormField
					control={form.control}
					name='apiKeyRequired'
					render={({ field }) => (
						<FormItem className='flex justify-between gap-4 items-center space-y-0'>
							<FormLabel>
								<p>{t('endpoint.create.apiKey.title')}</p>
								<p className='text-subtle'>{t('endpoint.create.apiKey.label')}</p>
							</FormLabel>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='sessionRequired'
					render={({ field }) => (
						<FormItem className='flex justify-between gap-4 items-center space-y-0'>
							<FormLabel>
								<p>{t('endpoint.create.session.title')}</p>
								<p className='text-subtle'>{t('endpoint.create.session.label')}</p>
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
								<p>{t('endpoint.create.logExecution.title')}</p>
								<p className='text-subtle'>{t('endpoint.create.logExecution.label')}</p>
							</FormLabel>

							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>
			</div>
			<Separator className='my-6' />
			<div className='space-y-6'>
				<FormField
					control={form.control}
					name='rateLimits'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('general.name')}</FormLabel>
							<FormControl>
								<SortableRateLimits
									selectedLimits={field.value as string[]}
									onDragEnd={(result: DropResult) => {
										const ordered = reorder(
											field.value as string[],
											result.source.index,
											result?.destination?.index ?? 0,
										);
										field.onChange(ordered);
									}}
									options={rateLimits?.filter((lmt) => field.value?.includes(lmt.iid))}
									onSelect={(limiter: RateLimit) => {
										if (!field.value) field.onChange([limiter.iid]);
										else field.onChange([...field.value, limiter.iid]);
									}}
									onDeleteItem={(id: string) => {
										const newLimits = field.value?.filter((item) => item !== id);
										field.onChange(newLimits);
									}}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='middlewares'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('general.name')}</FormLabel>
							<FormControl>
								<EndpointMiddlewares field={field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
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
		</>
	);
}
