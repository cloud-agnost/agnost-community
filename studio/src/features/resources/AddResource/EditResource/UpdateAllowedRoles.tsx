import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import useResourceStore from '@/store/resources/resourceStore';
import useTypeStore from '@/store/types/typeStore';
import { AllowedRole } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { useToast } from '@/hooks';
import { useState } from 'react';
const UpdateAllowedRolesSchema = z.object({
	allowedRoles: z.nativeEnum(AllowedRole).array(),
});

export default function UpdateAllowedRoles() {
	const [loading, setLoading] = useState(false);
	const { notify } = useToast();
	const { t } = useTranslation();
	const { appRoles } = useTypeStore();
	const { resourceToEdit, updateResourceAllowedRoles } = useResourceStore();
	const form = useForm({
		resolver: zodResolver(UpdateAllowedRolesSchema),
		defaultValues: {
			allowedRoles: resourceToEdit?.allowedRoles ?? ['Admin'],
		},
	});

	function onSubmit(data: z.infer<typeof UpdateAllowedRolesSchema>) {
		setLoading(true);
		updateResourceAllowedRoles({
			name: resourceToEdit?.name,
			allowedRoles: data.allowedRoles,
			resourceId: resourceToEdit?._id,
			onSuccess: () => {
				setLoading(false);
				// closeEditResourceModal();
				// form.reset();
			},
			onError: ({ error, details }) => {
				setLoading(false);
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}

	return (
		<Form {...form}>
			<form className='flex flex-col' onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='allowedRoles'
					render={({ field: { onChange, value } }) => (
						<div className='space-y-2'>
							<FormLabel>{t('resources.table.allowedRoles')}</FormLabel>
							<div className='flex items-center space-x-6 space-y-0'>
								{appRoles.map((role) => (
									<FormItem key={role} className='flex flex-row items-start space-x-4 space-y-0'>
										<FormControl>
											<Checkbox
												disabled={role === 'Admin'}
												checked={value?.includes(role as AllowedRole)}
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
								))}
								<FormMessage />
							</div>
						</div>
					)}
				/>
				<Button type='submit' variant='primary' className='self-end' size='lg' loading={loading}>
					{t('general.save')}
				</Button>
			</form>
		</Form>
	);
}
