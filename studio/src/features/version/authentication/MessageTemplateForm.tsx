import { AccordionContent, AccordionTrigger } from '@/components/Accordion';
import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { Document } from '@/components/icons';
import useVersionStore from '@/store/version/versionStore';
import { VersionMessageTemplate, TemplateTypes } from '@/types';
import { capitalize } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { CaretDown, FloppyDisk } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'; // Import the Monaco API
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks';
import { translate as t } from '@/utils';

const USER_VARIABLES = ['name', 'email', 'firstName', 'lastName'];
const TOKEN_VARIABLES = ['email', 'confirmationUrl', 'redirectUrl', 'token', 'expiresIn'];

const MessageTemplatesSchema = z
	.object({
		type: z.nativeEnum(TemplateTypes),
		subject: z.string().optional(),
		body: z.string({
			required_error: t('forms.required', {
				label: t('version.authentication.body'),
			}),
		}),
		fromName: z.string().optional(),
		fromEmail: z.string().email().optional(),
	})
	.superRefine((data, ctx) => {
		const { type, subject, fromName, fromEmail } = data;

		if (type !== TemplateTypes.VerifySMSCode) {
			if (!subject) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.subject'),
					}),
					path: ['subject'],
				});
			}
			if (!fromName) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.fromName'),
					}),
					path: ['fromName'],
				});
			}
			if (!fromEmail) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: t('forms.required', {
						label: t('version.authentication.fromEmail'),
					}),
					path: ['fromEmail'],
				});
			}
		}
	});

export default function MessageTemplateForm({ template }: { template: VersionMessageTemplate }) {
	const { notify } = useToast();
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
	const { setAuthMessageTemplate, version } = useVersionStore();
	const form = useForm<z.infer<typeof MessageTemplatesSchema>>({
		resolver: zodResolver(MessageTemplatesSchema),
		defaultValues: template,
	});
	function onSubmit(data: z.infer<typeof MessageTemplatesSchema>) {
		setAuthMessageTemplate({
			...data,
			orgId: version?.orgId,
			versionId: version?._id,
			appId: version?.appId,
			onSuccess: () => {
				notify({
					type: 'success',
					title: t('general.success'),
					description: t('version.authentication.messageTemplateUpdated'),
				});
			},
			onError: (error) => {
				notify({
					type: 'error',
					title: t('general.error'),
					description: error.details,
				});
			},
		});
	}

	function insertVariable(variable: string) {
		const selection = editor?.getSelection();
		const range = new monaco.Range(
			selection?.startLineNumber as number,
			selection?.startColumn as number,
			selection?.endLineNumber as number,
			selection?.endColumn as number,
		);
		const id = { major: 1, minor: 1 };
		const text = `{{${variable}}}`;
		const op = { identifier: id, range, text, forceMoveMarkers: true };
		editor?.executeEdits('my-source', [op]);
	}

	return (
		<Form {...form}>
			<form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
				<AccordionTrigger className='border-b border-border p-4 group cursor-pointer' asChild>
					<div className='flex items-center justify-between w-full'>
						<div className='flex items-center gap-4'>
							<CaretDown
								size={20}
								className='text-icon-base transition-transform duration-200 group-data-[state=open]:rotate-180'
							/>
							<h6 className='font-sfCompact text-default select-none'>
								{capitalize(template.type).replace(/_/g, ' ').toUpperCase()}
							</h6>
						</div>
						<div className='flex items-center gap-4'>
							<Button type='submit' variant='primary' onClick={(e) => e.stopPropagation()}>
								<FloppyDisk className='mr-2' />
								{t('general.save')}
							</Button>
						</div>
					</div>
				</AccordionTrigger>
				<AccordionContent className='p-4'>
					<div className='space-y-6'>
						{template.type !== 'verify_sms_code' && (
							<>
								<div className='flex gap-4'>
									<FormField
										control={form.control}
										name='fromName'
										render={({ field }) => {
											return (
												<FormItem className='flex-1'>
													<FormLabel>{t('version.authentication.fromName')}</FormLabel>
													<FormControl>
														<Input
															error={!!form.formState.errors.fromName}
															placeholder={
																t('forms.placeholder', {
																	label: t('version.authentication.fromName'),
																}) ?? ''
															}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
									<FormField
										control={form.control}
										name='fromEmail'
										render={({ field }) => {
											return (
												<FormItem className='flex-1'>
													<FormLabel>{t('version.authentication.fromEmail')}</FormLabel>
													<FormControl>
														<Input
															error={!!form.formState.errors.fromEmail}
															placeholder={
																t('forms.placeholder', {
																	label: t('version.authentication.fromEmail'),
																}) ?? ''
															}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											);
										}}
									/>
								</div>
								<FormField
									control={form.control}
									name='subject'
									render={({ field }) => {
										return (
											<FormItem>
												<FormLabel>{t('version.authentication.subject')}</FormLabel>
												<FormControl>
													<Input
														error={!!form.formState.errors.subject}
														placeholder={
															t('forms.placeholder', {
																label: t('version.authentication.subject'),
															}) ?? ''
														}
														{...field}
													/>
												</FormControl>

												<FormMessage />
											</FormItem>
										);
									}}
								/>
							</>
						)}
						<FormField
							control={form.control}
							name='body'
							render={({ field }) => {
								return (
									<FormItem className='flex-1'>
										<div className='flex items-center gap-4'>
											<FormLabel>{t('version.authentication.body')}</FormLabel>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='secondary' iconOnly>
														<Document className='w-4 h-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													className='w-56'
													onCloseAutoFocus={() => {
														const selection = editor?.getSelection();
														editor?.setPosition({
															lineNumber: selection?.startLineNumber as number,
															column: selection?.startColumn as number,
														});
														window.requestAnimationFrame(() => {
															editor?.focus();
														});
													}}
												>
													<DropdownMenuLabel className='text-subtle'>User</DropdownMenuLabel>
													<DropdownMenuGroup>
														{USER_VARIABLES.map((variable) => (
															<DropdownMenuItem
																onClick={() => insertVariable(variable)}
																key={variable}
															>
																{variable}
															</DropdownMenuItem>
														))}
													</DropdownMenuGroup>
													<DropdownMenuSeparator />
													<DropdownMenuLabel className='text-subtle'>Token</DropdownMenuLabel>
													<DropdownMenuGroup>
														{TOKEN_VARIABLES.map((variable) => (
															<DropdownMenuItem
																onClick={() => insertVariable(variable)}
																key={variable}
															>
																{variable}
															</DropdownMenuItem>
														))}
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
										<FormControl>
											<CodeEditor
												defaultLanguage='html'
												containerClassName='h-[200px] w-full'
												value={field.value}
												onChange={field.onChange}
												onMount={setEditor}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>
				</AccordionContent>
			</form>
		</Form>
	);
}
