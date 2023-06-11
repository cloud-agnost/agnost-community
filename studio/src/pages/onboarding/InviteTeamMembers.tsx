import { Alert, AlertDescription } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import useClusterStore from '@/store/cluster/clusterStore';
import useOnboardingStore from '@/store/onboarding/onboardingStore';
import { APIError } from '@/types';
import { cn } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from '@phosphor-icons/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useOutletContext, useNavigate } from 'react-router-dom';
import * as z from 'zod';
async function loader() {
	return null;
}
const appRoles = ['Admin', 'Developer', 'Viewer'];
export default function InviteTeamMembers() {
	const [error, setError] = useState('');
	const { goBack } = useOutletContext() as { goBack: () => void };
	const { setStepByPath, setDataPartially, data: onboardingReq } = useOnboardingStore();
	const { finalizeClusterSetup } = useClusterStore();
	const navigate = useNavigate();

	const FormSchema = z.object({
		member: z
			.array(
				z
					.object({
						email: z.string().email().optional().or(z.literal('')),
						role: z.enum(['Admin', 'Developer', 'Viewer']).optional().or(z.literal('')),
					})
					.superRefine((val, ctx) => {
						const { email, role } = val;
						if (email && !role) {
							return ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: 'Role is required',
							});
						}
					}),
			)
			.superRefine((val, ctx) => {
				const emails = val.map((v) => v.email).filter(Boolean);
				if (_.uniq(emails).length !== emails.length) {
					return ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Emails must be unique',
					});
				}
			}),
	});
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});
	async function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log(data);
		const appMembers = data.member.filter((item) => item.email !== '' && item.role !== '');
		setDataPartially({
			appMembers,
		});
		setStepByPath('/onboarding/invite-team-members', {
			isDone: true,
		});
		const res = await finalizeClusterSetup({
			...onboardingReq,
			appMembers,
		});

		if ('error' in res) {
			setError(res.details);
			return;
		}
		navigate('/organization');
	}
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'member',
	});

	useEffect(() => {
		append({ email: '', role: '' });
	}, []);

	useEffect(() => {
		if (_.isEmpty(form.formState.errors)) {
			return;
		}
		const { member } = form.formState.errors;

		if (!_.isEmpty(member) && _.isArray(member)) {
			member.forEach((e, index) => {
				if (e?.type === 'custom') {
					if (e?.message === 'Role is required') {
						form.setError(`member.${index}.role`, {
							type: 'required',
							message: 'Role is required',
						});
					}
				}
			});
		}
		setError(member?.message || '');
	}, [form.formState.errors]);
	console.log(form.formState.errors.member?.[0]?.email);

	return (
		<div className='max-w-xl space-y-12'>
			<Description title='Invite Members To App Team'>
				You can invite team members to your application with different role profiles. These team
				members will also become organization members and can be easily added as member to other
				organization apps.
			</Description>
			{error && (
				<Alert variant='error'>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
					{fields.map((f, index) => (
						<div className='flex gap-2' key={f.id}>
							<FormField
								control={form.control}
								name={`member.${index}.email`}
								render={({ field }) => (
									<FormItem className='flex-1'>
										{index === 0 && <FormLabel>Email</FormLabel>}
										<FormControl>
											<Input
												placeholder='Email'
												error={!!form.formState.errors.member?.[index]?.email}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`member.${index}.role`}
								render={({ field }) => (
									<FormItem className='w-[180px]'>
										{index === 0 && <FormLabel>Role</FormLabel>}
										<Select onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a role' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{appRoles.map((role) => (
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
							<Button
								type='button'
								variant='secondary'
								className={cn(
									!index && 'self-end',
									!_.isEmpty(form.formState.errors) && !index && 'self-center mt-2',
									!_.isEmpty(form.formState.errors) &&
										_.isEmpty(form.formState.errors.member?.[0]) &&
										!index &&
										'self-end',
								)}
								icon={true}
								onClick={() => {
									remove(index);
								}}
							>
								<Trash size={16} className='text-subtle' />
							</Button>
						</div>
					))}

					{fields.length < 50 && (
						<Button
							type='button'
							variant='text'
							onClick={() => {
								append({ email: '', role: '' });
							}}
						>
							<Plus size={16} />
							<span className='ml-2'>Add Another One</span>
						</Button>
					)}
					<div className='flex items-center justify-end gap-4'>
						<Button variant='text' size='lg' onClick={goBack}>
							Previous
						</Button>
						<Button variant='primary' size='lg'>
							Finish
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

InviteTeamMembers.loader = loader;
