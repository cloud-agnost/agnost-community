import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { TransferRequest } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';
interface TransferOwnershipProps {
	disabled: boolean;
	transferFn: (data: TransferRequest) => Promise<any>;
	type: 'org' | 'app' | 'cluster';
}

const TransferOwnershipSchema = z.object({
	userId: z.string().nonempty(),
});

export default function TransferOwnership({ transferFn, type, disabled }: TransferOwnershipProps) {
	const user = useAuthStore((state) => state.user);
	const { t } = useTranslation();
	const { members } = useOrganizationStore();
	const { applicationTeam } = useApplicationStore();
	const team =
		type === 'app'
			? applicationTeam.filter(({ member }) => member._id !== user?._id)
			: members.filter(({ member }) => member._id !== user?._id);
	const { notify } = useToast();
	const { orgId, appId } = useParams() as Record<string, string>;
	const form = useForm<z.infer<typeof TransferOwnershipSchema>>({
		mode: 'onChange',
		resolver: zodResolver(TransferOwnershipSchema),
	});

	const {
		mutateAsync,
		isLoading: loading,
		error,
	} = useMutation({
		mutationFn: transferFn,
		onSuccess: () => {
			form.reset();
			notify({
				title: t('general.success'),
				description: t('organization.transfer-success'),
				type: 'success',
			});
		},
		onError: (err) => {
			notify({
				title: err.error,
				description: err.details,
				type: 'error',
			});
		},
	});

	const onSubmit = async (data: z.infer<typeof TransferOwnershipSchema>) => {
		console.log(data);
		mutateAsync({
			...data,
			...(type === 'org' && { orgId: orgId }),
			...(type === 'app' && { appId: appId }),
		});
	};

	return (
		<div className='space-y-4'>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error?.error}</AlertTitle>
					<AlertDescription>{error?.details}</AlertDescription>
				</Alert>
			)}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
					<FormField
						control={form.control}
						name='userId'
						render={({ field }) => (
							<FormItem className='space-y-1'>
								<FormControl>
									<Select defaultValue={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger error={error} className='w-full !h-11 [&>span]:!max-w-full'>
												<SelectValue
													placeholder={`${t('general.select')} ${t('general.member.title')}`}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent align='center'>
											{team.map(({ member }) => (
												<SelectItem key={member._id} value={member._id}>
													<div className='flex items-center gap-2'>
														<Avatar size='sm'>
															<AvatarImage src={member.pictureUrl} />
															<AvatarFallback
																isUserAvatar
																color={member?.color}
																name={member?.name}
															/>
														</Avatar>
														<div className='flex-1'>
															<p className='block text-default text-sm leading-6'>{member.name}</p>
															<p className='text-[11px] text-subtle leading-[21px]'>
																{member.loginEmail}
															</p>
														</div>
													</div>
												</SelectItem>
											))}
											{!team.length && (
												<SelectItem value='empty' disabled>
													{t('general.no_member_found')}
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						size='lg'
						className='text-end'
						type='submit'
						loading={loading}
						disabled={disabled || !form.formState.isValid}
					>
						{t('organization.transfer')}
					</Button>
				</form>
			</Form>
		</div>
	);
}
