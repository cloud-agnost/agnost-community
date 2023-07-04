import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';

export default function EmptyStatus() {
	const { t } = useTranslation();

	function deployHandler() {
		// TODO: implement deployHandler
		console.log('deployHandler');
	}

	return (
		<div className='p-4 w-full flex items-center justify-center flex-col gap-4 [&>*]:shrink-0'>
			<AuthUserAvatar size='xl' />
			<p className='font-sfCompact text-sm text-default leading-6'>
				{t('version.deployment_status_empty')}
			</p>
			<Button onClick={deployHandler}>{t('version.deploy')}</Button>
		</div>
	);
}
