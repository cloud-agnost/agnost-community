import { TAB_ICON_MAP } from '@/constants';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { DotsThreeVertical } from '@phosphor-icons/react';

export default function useTabIcon(className: string) {
	function getTabIcon(type: TabTypes) {
		const Icon = TAB_ICON_MAP[type];
		if (!Icon) return <DotsThreeVertical size={15} weight='bold' />;
		return (
			<Icon className={cn('text-subtle hover:text-default group-hover:text-default', className)} />
		);
	}

	return getTabIcon;
}
