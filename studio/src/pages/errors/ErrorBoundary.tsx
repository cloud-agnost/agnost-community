import { Button } from '@/components/Button';
import { ErrorPage } from '@/components/icons';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '@phosphor-icons/react';
import { useRouteError } from 'react-router-dom';
export default function ErrorBoundary() {
	const { t } = useTranslation();
	const error = useRouteError();

	console.error('Error', error);

	return (
		<div className='w-full h-screen flex flex-col items-center justify-center'>
			<div className='flex flex-col items-center space-y-2'>
				<ErrorPage className='w-36 h-32' />
				<h2 className='text-default text-2xl font-semibold'>{t('general.internalServerError')}</h2>
				<p className='text-lg text-subtle font-sfCompact'>
					{t('general.internalServerErrorDescription')}
				</p>
			</div>

			<div className='flex items-center'>
				<Button className='mt-8' variant='primary' to='/organization'>
					<ArrowLeft className='mr-2' />
					{t('general.backToHome')}
				</Button>
				<Button className='mt-8 ml-4' variant='secondary'>
					{t('general.messageUs')}
				</Button>
			</div>
		</div>
	);
}
