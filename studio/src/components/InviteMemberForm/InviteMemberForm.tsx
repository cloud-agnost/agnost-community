import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { APIError } from '@/types';
import { cn, isArray, isEmpty, uniq } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

interface InviteMemberFormProps {
	submitForm: (data: any, setError: (error: APIError | null) => void) => void;
	roles: string[];
	actions: React.ReactNode;
	title?: string;
	description?: string;
}

export default function InviteMemberForm({
	submitForm,
	roles,
	actions,
	title,
	description,
}: InviteMemberFormProps) {
	const [error, setError] = useState<APIError | null>();
	const FormSchema = z.object({
		member: z
			.array(
				z
					.object({
						email: z.string().email().optional().or(z.literal('')),
						role: z
							.string()
							.refine((value) => roles.includes(value), {
								message: 'Invalid Value',
							})
							.optional()
							.or(z.literal('')),
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
				if (uniq(emails).length !== emails.length) {
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
		submitForm(
			data.member.filter((item) => item.email !== '' && item.role !== ''),
			setError,
		);
		form.reset();
	}
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'member',
	});

	useEffect(() => {
		append({ email: '', role: '' });
	}, []);

	useEffect(() => {
		if (isEmpty(form.formState.errors)) {
			return;
		}
		const { member } = form.formState.errors;

		if (!isEmpty(member) && isArray(member)) {
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
		setError({
			error: 'Error',
			details: member?.message || '',
			code: member?.message || '',
		});
	}, [form.formState.errors]);
	return (
		<div className='max-w-2xl space-y-12'>
			{title && <Description title={title}>{description}</Description>}
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error.error}</AlertTitle>
					<AlertDescription>{error.details}</AlertDescription>
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
									<FormItem>
										{index === 0 && <Label>Role</Label>}
										<Select onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger className='w-[180px]'>
													<SelectValue placeholder='Select a role' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{roles.map((role) => (
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
								disabled={fields.length === 1}
								className={cn(
									!index && 'self-end',
									!isEmpty(form.formState.errors) && !index && 'self-center mt-2',
									!isEmpty(form.formState.errors) &&
										isEmpty(form.formState.errors.member?.[0]) &&
										!index &&
										'self-end',
								)}
								onClick={() => {
									remove(index);
								}}
							>
								<Trash size={16} className='text-subtle' />
							</Button>
						</div>
					))}
					<div className='flex justify-between items-center mt-8'>
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
						{actions}
					</div>
				</form>
			</Form>
		</div>
	);
}
