import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { cn, isEmpty, translate } from '@/utils';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from 'components/Input';
import { FormEvent, ReactNode, useState } from 'react';
import { Separator } from 'components/Separator';
import useTypeStore from '@/store/types/typeStore.ts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/Select';
import { DATABASE_TYPES } from '@/constants';
import { Button } from 'components/Button';
import { AnimatePresence, motion } from 'framer-motion';

interface CreateDatabaseDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
}

const Schema = z.object({
	step1: z.object({
		name: z
			.string({
				required_error: translate('forms.required', {
					label: translate('general.name'),
				}),
			})
			.min(2, translate('forms.min2.error', { label: translate('general.name') }))
			.max(64, translate('forms.max64.error', { label: translate('general.name') }))
			.trim()
			.refine(
				(value) => value.trim().length > 0,
				translate('forms.required', {
					label: translate('general.name'),
				}),
			),
		type: z
			.string({
				required_error: translate('forms.required', {
					label: translate('database.add.type.field'),
				}),
			})
			.refine((value) => useTypeStore.getState().instanceTypes.database.includes(value), {
				message: translate('forms.invalid', {
					label: translate('database.add.type.field'),
				}),
			}),
	}),
});

export default function CreateDatabaseDrawer({
	open,
	onOpenChange,
	editMode,
}: CreateDatabaseDrawerProps) {
	const { t } = useTranslation();
	const [step, setStep] = useState(1);
	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
	});

	const steps: Record<number, { element: ReactNode; title: string; hasError: () => boolean }> = {
		1: {
			element: <CreateDatabase />,
			hasError: () => Object.values(form.getValues('step1')).every((item) => isEmpty(item)),
			title: t('database.add.title'),
		},
		2: {
			element: <ResourceManagement />,
			hasError: () => Object.values(form.getValues('step1')).every((item) => isEmpty(item)),
			title: t('database.add.resource.title'),
		},
	};

	const stepCount = Object.keys(steps).length;
	const lastStep = step === stepCount;

	function nextStep() {
		if (step < stepCount) {
			setStep((prevState) => prevState + 1);
		}
	}

	function prevStep() {
		if (step > 1) {
			setStep((prevState) => prevState - 1);
		}
	}

	async function onSubmit(data: z.infer<typeof Schema>) {
		console.log(data);
	}

	function formHandler(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		form.handleSubmit(onSubmit)(event);

		const hasError = steps[step].hasError();
		if (!hasError && !lastStep) {
			console.log('go to next step');
			return nextStep();
		}
	}

	return (
		<Drawer open={open || true} onOpenChange={onOpenChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='relative'>
					<DrawerTitle>{editMode ? t('database.edit.title') : t('database.add.title')}</DrawerTitle>
					<div className='absolute left-[-1px] bottom-0 w-full right-0 h-1 translate-y-full bg-lighter'>
						<motion.span
							animate={{ width: `${(step / stepCount) * 100}%` }}
							className={cn('block h-full bg-elements-green')}
						/>
					</div>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					<div className='font-sfCompact'>
						<p className='text-subtle text-sm'>
							{t('general.step', {
								currentStep: step,
								totalSteps: stepCount,
							})}
						</p>
						<p className='text-default'>{steps[step].title}</p>
					</div>
					<Form {...form}>
						<form className='space-y-6' onSubmit={formHandler}>
							<AnimatePresence>{steps[step].element}</AnimatePresence>
							<div className='flex justify-between'>
								<DrawerClose asChild>
									<Button type='button' variant='outline' size='lg'>
										{t('general.cancel')}
									</Button>
								</DrawerClose>
								<div className='flex gap-2'>
									{step !== 1 && (
										<Button type='button' variant='secondary' onClick={prevStep} size='lg'>
											{t('general.previous')}
										</Button>
									)}
									<Button size='lg'>{t('general.next')}</Button>
								</div>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function CreateDatabase() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof Schema>>();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='space-y-6'
			transition={{ type: 'tween' }}
		>
			<FormField
				control={form.control}
				name='step1.name'
				render={({ field, formState: { errors } }) => (
					<FormItem className='space-y-1'>
						<FormLabel>{t('database.add.field')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(errors.step1?.name)}
								type='text'
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
				name='step1.type'
				render={({ field, formState: { errors } }) => (
					<FormItem className='space-y-1'>
						<FormLabel>{t('database.add.type.field')}</FormLabel>
						<FormControl>
							<Select onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger
										className={cn('w-full input', errors.step1?.type && 'input-error')}
									>
										<SelectValue
											className={cn('text-subtle')}
											placeholder={t('database.add.type.placeholder')}
										/>
									</SelectTrigger>
								</FormControl>
								<SelectContent align='center'>
									{DATABASE_TYPES.map((type) => (
										<SelectItem
											checkClassName='right-2 left-auto top-1/2 -translate-y-1/2'
											className='px-3 py-[6px] w-full max-w-full'
											key={type.id}
											value={type.name}
										>
											<div className='flex items-center gap-2'>
												<type.icon />
												{type.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</motion.div>
	);
}
function ResourceManagement() {
	//const { t } = useTranslation();
	//const form = useFormContext<z.infer<typeof Schema>>();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='space-y-6'
			transition={{ type: 'tween' }}
		>
			ResourceManagemant
		</motion.div>
	);
}
