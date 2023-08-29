import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Tab } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function useTabNavigate() {
	const { getCurrentTab, updateCurrentTab } = useTabStore();
	const { version } = useVersionStore();
	const navigate = useNavigate();

	return (tab: Tab) => {
		const currentTab = getCurrentTab(version?._id as string);
		if (currentTab?.path === tab.path) return;
		navigate(tab.path);
		if (currentTab) {
			updateCurrentTab(version?._id as string, tab);
		}
	};
}
