import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/Drawer';
import {
	Form,
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
import {
	BADGE_COLOR_MAP,
	NAME_REGEX,
	NOT_START_WITH_NUMBER_REGEX,
	NUMBER_REGEX,
	PARAM_NAME_REGEX,
	PARAM_REGEX,
	ROUTE_NAME_REGEX,
} from '@/constants';
import useVersionStore from '@/store/version/versionStore';
import { RateLimit } from '@/types';
import { cn, reorder, translate as t } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { DropResult } from 'react-beautiful-dnd';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SortableRateLimits } from '../version/SettingsGeneral';
import EndpointMiddlewares from './EndpointMiddlewares';
interface CreateEndpointProps {
	open: boolean;
	onClose: () => void;
}
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
export const CreateEndpointSchema = z.object({
	name: z
		.string({
			required_error: t('forms.required', {
				label: t('general.name'),
			}),
		})
		.nonempty()
		.regex(NAME_REGEX, {
			message: t('forms.invalid_characters', {
				label: t('general.name'),
			}),
		})
		.regex(NOT_START_WITH_NUMBER_REGEX, {
			message: t('forms.notStartWithNumber', {
				label: t('general.name'),
			}),
		})
		.min(2, {
			message: t('forms.min2.error', {
				label: t('general.name'),
			}),
		})
		.max(64, {
			message: t('forms.max64.error', {
				label: t('general.name'),
			}),
		})
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			t('forms.required', {
				label: t('general.name'),
			}),
		)
		.refine((value) => !value.startsWith('_'), {
			message: t('forms.notStartWithUnderscore', {
				label: t('general.name'),
			}),
		})
		.refine(
			(value) => value !== 'this',
			(value) => ({
				message: t('forms.reservedKeyword', {
					keyword: value,
					label: t('general.name'),
				}),
			}),
		),

	method: z.enum(HTTP_METHODS, {
		required_error: t('forms.required', {
			label: t('endpoint.create.path'),
		}),
	}),
	path: z
		.string({
			required_error: t('forms.required', {
				label: t('endpoint.create.path'),
			}),
		})
		.nonempty()
		.regex(ROUTE_NAME_REGEX, {
			message: t('endpoint.errors.notValidRoute'),
		})
		.startsWith('/', {
			message: t('forms.invalid', {
				label: t('endpoint.create.path'),
			}),
		})
		.superRefine((value, ctx) => {
			const parameterNames: string[] = [];

			let match;
			while ((match = PARAM_REGEX.exec(value)) !== null) {
				parameterNames.push(match[1]);
			}

			// Validate parameter names
			for (const paramName of parameterNames) {
				if (!PARAM_NAME_REGEX.test(paramName)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('endpoint.errors.invalidParams', {
							param: paramName,
						}),
					});
				}
			}
			const uniqueParameterNames = new Set(parameterNames);
			if (uniqueParameterNames.size !== parameterNames.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('endpoint.errors.duplicateParam'),
				});
			}
		}),
	timeout: z
		.string({
			required_error: t('forms.required', {
				label: t('endpoint.create.timeout'),
			}),
		})
		.regex(
			NUMBER_REGEX,
			t('forms.number', {
				label: t('endpoint.create.timeout'),
			}),
		)
		.transform((val) => Number(val)),
	apiKeyRequired: z.boolean().default(false),
	sessionRequired: z.boolean().default(false),
	logExecution: z.boolean().default(false),
	rateLimits: z.array(z.string()).optional(),
	middlewares: z.array(z.string()).optional(),
});

export default function CreateEndpoint({ open, onClose }: CreateEndpointProps) {
	const rateLimits = useVersionStore((state) => state.version?.limits);

	const form = useForm<z.infer<typeof CreateEndpointSchema>>({
		resolver: zodResolver(CreateEndpointSchema),
	});

	function onSubmit(data: z.infer<typeof CreateEndpointSchema>) {
		console.log(data);
	}
	console.log(form.formState.errors);
	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader className='border-none'>
					<DrawerTitle>{t('endpoint.create.title')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
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
										<Select onValueChange={field.onChange}>
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
												{HTTP_METHODS.map((role) => (
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
												options={rateLimits?.filter((lmt) => !field.value?.includes(lmt.iid))}
												onSelect={(limiter: RateLimit) => {
													if (!field.value) field.onChange([limiter.iid]);
													else field.onChange([...field.value, limiter.iid]);
												}}
												onDeleteItem={(id: string) => {
													const newLimits = field.value?.filter((item) => item !== id);
													field.onChange(newLimits);
												}}
												form
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
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
