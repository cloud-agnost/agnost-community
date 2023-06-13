import { Description } from '@/components/Description';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useOutletContext } from 'react-router-dom';
import useOnboardingStore from '@/store/onboarding/onboardingStore.ts';

async function loader() {
	return null;
}

const FormSchema = z.object({
	appName: z
		.string({ required_error: 'App name is required' })
		.min(2, 'App name must be at least 2 characters long')
		.max(64, 'App name must be at most 64 characters long'),
});

export default function CreateApp() {
	const navigate = useNavigate();
	const { goBack } = useOutletContext() as { goBack: () => void };
	const { setDataPartially, getCurrentStep, goToNextStep } = useOnboardingStore();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		setDataPartially({ appName: data.appName });
		const { nextPath } = getCurrentStep();
		if (nextPath) {
			navigate(nextPath);
			goToNextStep(true);
		}
	}

	return (
		<>
			<Description title='Create Your First App'>
				In Agnost, you work on apps and their versions. An app is your workspace that packages all
				required design and configuration elements to run your backend app services.
			</Description>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='appName'
						render={({ field }) => (
							<FormItem>
								<FormLabel>App Name</FormLabel>
								<FormControl>
									<Input
										error={!!form.formState.errors.appName}
										placeholder='Enter app name'
										{...field}
									/>
								</FormControl>
								<FormDescription>Maximum 64 characters</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex gap-1 justify-end'>
						<Button onClick={goBack} type={'button'} variant='text' size='lg'>
							Previous
						</Button>
						<Button size='lg'>Next</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

CreateApp.loader = loader;
