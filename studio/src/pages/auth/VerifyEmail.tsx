import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';

async function loader(params: any) {
	console.log(params);
	return null;
}

export default function VerifyEmail() {
	const email = 'matey@gmail.com';
	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Verify Your Email'>
					We&apos;ve sent a six-digit confirmation code to{' '}
					<span className='text-default'>{email}</span>. Please enter your code below to activate
					your account.
				</Description>

				<div className='text-default'>
					{/* TODO :: Code input buraya gelecek hazır değil */}
					Code input buraya gelecek hazır değil
				</div>

				<Description>
					Keep this window open while checking for your code. If you haven&apos;t received our
					email, please check your spam folder.
				</Description>

				<div className='flex justify-end gap-1'>
					<Button className='w-[165px]'>Verify</Button>
				</div>
			</div>
		</AuthLayout>
	);
}

VerifyEmail.loader = loader;
