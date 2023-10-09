import { Button } from '@/components/Button';
import { useTabNavigate } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
interface TabLinkProps {
	className?: string;
	name: string;
	path: string;
	type: TabTypes;
	onClick?: () => void;
}

export default function TabLink({ className, name, path, onClick, type, ...props }: TabLinkProps) {
	const tabNavigate = useTabNavigate();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { getTabsByVersionId, setCurrentTab } = useTabStore();
	const { versionId } = useParams<{ versionId: string }>();

	function handleClickTabLink() {
		onClick?.();
		const tabs = getTabsByVersionId(versionId as string);
		const tabPath = `${pathname}/${path}`;
		const tab = tabs.find((tab) => tab.path === tabPath);

		if (!tab) {
			tabNavigate({
				title: name,
				path: tabPath,
				isActive: true,
				isDashboard: false,
				type,
			});
		} else {
			setCurrentTab(versionId as string, tab.id);
			navigate(tabPath);
		}
	}
	return (
		<Button
			variant='blank'
			onClick={handleClickTabLink}
			className={cn(className, 'link')}
			{...props}
		>
			{name}
		</Button>
	);
}
