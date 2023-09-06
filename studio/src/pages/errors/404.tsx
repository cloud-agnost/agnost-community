import { Button } from '@/components/Button';
import { Svg401 } from '@/components/icons';
import { ArrowLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
export default function NotFound() {
	const { t } = useTranslation();
	return (
		<div className='w-full h-screen flex flex-col items-center justify-center'>
			<div className='flex flex-col items-center space-y-2'>
				<Svg401 className='w-36 h-32' />
				<h2 className='text-default text-2xl font-semibold'>{t('general.pageNotFound')}</h2>
				<p className='text-lg text-subtle font-sfCompact'>{t('general.pageNotFoundDescription')}</p>
			</div>

			<Button className='mt-8' variant='primary' to='/organization'>
				<ArrowLeft className='mr-2' />
				{t('general.backToHome')}
			</Button>
			<div className='flex items-center gap-2 mt-2'>
				<p className='text-default font-sfCompact'>{t('general.stillHavingTrouble')}</p>
				<Button className='underline' variant='blank'>
					{t('general.messageUs')}
				</Button>
			</div>
		</div>
	);
}
