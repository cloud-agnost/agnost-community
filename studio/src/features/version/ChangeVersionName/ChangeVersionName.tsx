import { Input } from 'components/Input';
import { Button } from '@/components/Button';
import { useTranslation } from 'react-i18next';
import useVersionStore from '@/store/version/versionStore.ts';

export default function ChangeVersionName() {
	const { t } = useTranslation();
	const { version } = useVersionStore();
	return (
		<>
			<Input defaultValue={version?.name} />
			<Button size='lg'>{t('general.save')}</Button>
		</>
	);
}
