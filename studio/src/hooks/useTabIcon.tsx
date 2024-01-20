import { TAB_ICON_MAP } from '@/constants';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { DotsThreeVertical } from '@phosphor-icons/react';

export default function useTabIcon(className: string) {
	const color: Record<string, string> = {
		[TabTypes.Bucket]: 'text-bucket',
		[TabTypes.Cache]: 'text-cache',
		[TabTypes.Dashboard]: 'text-dashboard',
		[TabTypes.Function]: 'text-function',
		[TabTypes.Middleware]: 'text-middleware',
		[TabTypes.Database]: 'text-database',
		[TabTypes.MessageQueue]: 'text-queue',
		[TabTypes.Task]: 'text-task',
		[TabTypes.Endpoint]: 'text-endpoint',
		[TabTypes.File]: 'text-file',
		[TabTypes.Field]: 'text-field',
		[TabTypes.Model]: 'text-model',
		[TabTypes.Storage]: 'text-storage',
	};
	function getTabIcon(type: TabTypes) {
		const Icon = TAB_ICON_MAP[type];
		return (
			<Icon
				className={cn(
					'text-subtle hover:text-default group-hover:text-default',
					`transition-colors duration-200 ${color[type]}`,
					className,
				)}
			/>
		);
	}

	return getTabIcon;
}
