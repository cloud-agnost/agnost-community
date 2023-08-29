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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { STORAGE_ICON_MAP } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { StorageSchema } from '@/types';
import { translate as t } from '@/utils';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';

interface StorageFormProps {
	edit?: boolean;
}
export default function StorageForm({ edit = false }: StorageFormProps) {
	const form = useFormContext<z.infer<typeof StorageSchema>>();
	const { getResources, resources } = useResourceStore();
	const { appId } = useParams<{
		appId: string;
		orgId: string;
	}>();

	function getResourceIcon(type: string) {
		const Icon = STORAGE_ICON_MAP[type];
		return <Icon className='w-6 h-6' /> ?? null;
	}
	useEffect(() => {
		getResources({
			appId: appId as string,
			type: 'storage',
		});
	}, []);
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

			{!edit && (
				<FormField
					control={form.control}
					name='resourceId'
					render={({ field }) => (
						<FormItem className='space-y-1'>
							<FormLabel>{t('queue.create.resource.title')}</FormLabel>
							<FormControl>
								<Select
									defaultValue={field.value}
									value={field.value}
									name={field.name}
									onValueChange={field.onChange}
								>
									<FormControl>
										<SelectTrigger
											error={Boolean(form.formState.errors.resourceId)}
											className='w-1/3'
										>
											<SelectValue
												placeholder={`${t('general.select')} ${t('queue.create.resource.title')}`}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent align='center'>
										{resources.map((resource) => (
											<SelectItem key={resource._id} value={resource._id}>
												<div className='flex items-center gap-2'>
													{getResourceIcon(resource.instance ?? '')}
													{resource.name}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormDescription>{t('queue.create.resource.description')}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			<DrawerFooter className='mt-8'>
				<div className='flex justify-end'>
					<DrawerClose asChild>
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
