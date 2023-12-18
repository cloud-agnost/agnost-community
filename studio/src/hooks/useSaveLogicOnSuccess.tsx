import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { useTranslation } from 'react-i18next';
import useToast from './useToast';

export default function useSaveLogicOnSuccess(description: string) {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { updateCurrentTab, getCurrentTab } = useTabStore();
	const { version } = useVersionStore();
	return function onSuccessSaveLogic() {
		updateCurrentTab(version._id, {
			...getCurrentTab(version._id),
			isDirty: false,
		});
		notify({
			title: t('general.success'),
			description,
			type: 'success',
		});
	};
}
