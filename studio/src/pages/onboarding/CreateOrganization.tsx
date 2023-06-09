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
	orgName: z
		.string({ required_error: 'Organization name is required' })
		.min(2, 'Organization name must be at least 2 characters long')
		.max(64, 'Organization name must be at most 64 characters long'),
});

export default function CreateOrganization() {
	const navigate = useNavigate();
	const { setStepByPath, setDataPartially } = useOnboardingStore();
	const { goBack } = useOutletContext() as { goBack: () => void };

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		setDataPartially({
			orgName: data.orgName,
		});
		navigate('/onboarding/create-app');
		setStepByPath('/onboarding/create-organization', {
			isDone: true,
		});
	}

	return (
		<>
			<Description title='Create Your Organization'>
				Organizations are the top level entities that are used to group your applications and manage
				organization specific resource (e.g., databases, cache, message brokers)
			</Description>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='orgName'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Organization Name</FormLabel>
								<FormControl>
									<Input
										error={!!form.formState.errors.orgName}
										placeholder='Enter organization name'
										{...field}
									/>
								</FormControl>
								<FormDescription>Maximum 64 characters</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='flex gap-1 justify-end'>
						<Button type='button' onClick={goBack} variant='text' className='w-[165px]'>
							Previous
						</Button>
						<Button className='w-[165px]'>Next</Button>
					</div>
				</form>
			</Form>
		</>
	);
}

CreateOrganization.loader = loader;
