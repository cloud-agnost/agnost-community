import { Button } from '@/components/Button';
import { useTabNavigate } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import { cn } from '@/utils';
import { useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
interface TabLinkProps {
	className?: string;
	name: string;
	path: string;
	onClick?: () => void;
}

export default function TabLink({ className, name, path, onClick, ...props }: TabLinkProps) {
	const navigate = useTabNavigate();
	const { pathname } = useLocation();
	const { getCurrentTab } = useTabStore();
	const { versionId } = useParams() as { versionId: string };
	return (
		<Button
			variant='blank'
			onClick={() => {
				onClick?.();
				navigate({
					id: getCurrentTab(versionId)?.id as string,
					title: name,
					path: `${pathname}/${path}`,
					isActive: true,
					isDashboard: false,
				});
			}}
			className={cn(className, 'link')}
			{...props}
		>
			{name}
		</Button>
	);
}
