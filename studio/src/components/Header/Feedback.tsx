import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/Popover';
import { toast } from '@/hooks/useToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lightbulb } from '@phosphor-icons/react';
import { Form, FormControl, FormField, FormItem, FormMessage } from 'components/Form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import { Button } from '../Button';
import { Textarea } from '../Input';
const FeedbackScheme = z.object({
	feedback: z.string({
		required_error: 'Feedback is required',
	}),
});
export default function Feedback() {
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof FeedbackScheme>>({
		resolver: zodResolver(FeedbackScheme),
	});
	const { orgId, appId, versionId } = useParams() as Record<string, string>;

	function onSubmit(data: z.infer<typeof FeedbackScheme>) {
		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');

		const raw = JSON.stringify({
			...data,
			orgId,
			appId,
			versionId,
			baseUrl: window.location.origin,
		});

		const requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
		};

		fetch('https://agnost.c1-europe.altogic.com/feedback', requestOptions)
			.then((response) => response.text())
			.then(() => {
				toast({
					title: 'Feedback sent',
					action: 'success',
				});
				form.reset();
			})
			.catch((error) => console.log('error', error));
	}

	return (
		<Popover
			onOpenChange={() => {
				form.reset();
			}}
		>
			<PopoverTrigger asChild>
				<Button
					variant='text'
					size='sm'
					className='header-menu-right-nav-item !text-subtle hover:!text-default'
				>
					<Lightbulb size={14} className='mr-1' />

					<span className='header-menu-right-nav-item-title font-sfCompact'>Feedback</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align='start' className='p-4'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className=' space-y-6'>
						<FormField
							control={form.control}
							name='feedback'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											error={!!form.formState.errors.feedback}
											rows={10}
											{...field}
											placeholder={
												t('forms.placeholder', {
													label: 'Feedback',
												}) ?? ''
											}
											className='h-32'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex items-center justify-end gap-2 border-t border-border'>
							<PopoverClose asChild>
								<Button variant='secondary' className='mr-2' size='lg'>
									{t('general.cancel')}
								</Button>
							</PopoverClose>

							<Button type='submit' size='lg'>
								{t('general.ok')}
							</Button>
						</div>
					</form>
				</Form>
			</PopoverContent>
		</Popover>
	);
}
