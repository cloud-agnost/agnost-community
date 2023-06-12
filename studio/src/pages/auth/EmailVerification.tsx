import { Description } from '@/components/Description';
import { AuthLayout } from '@/layouts/AuthLayout';
import './auth.scss';
import { Button } from '@/components/Button';

async function loader(params: any) {
	console.log(params);
	return null;
}

export default function EmailVerification() {
	const email = 'matey@gmail.com';
	return (
		<AuthLayout>
			<div className='auth-page'>
				<Description title='Email Verification'>
					Your email address has not been verified yet. You need to first verify your email to
					activate your Agnost account.
					<p className='mt-2'>
						Click button below to send the email verification code to{' '}
						<span className='text-default'>{email}</span>
					</p>
				</Description>
				<div className='flex justify-end gap-1'>
					<Button to='/login' variant='text' type='button' className='w-[165px]'>
						Back to Login
					</Button>
					<Button>Send Verify Code</Button>
				</div>
			</div>
		</AuthLayout>
	);
}

EmailVerification.loader = loader;
