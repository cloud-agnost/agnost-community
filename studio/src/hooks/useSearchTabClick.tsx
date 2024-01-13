import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { DesignElement, Tab, TabTypes } from '@/types';
import { generateId } from '@/utils';
import _ from 'lodash';
import { useParams } from 'react-router-dom';

export default function useSearchTabClick() {
	const { addTab } = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { versionId } = useParams() as Record<string, string>;

	function handleClickElement(item: DesignElement) {
		let url = `${item.type}/${item._id}/models`;
		if (_.capitalize(item.type) === TabTypes.Field)
			url = `database/${item.meta.dbId}/models/${item.modelId}/fields`;

		const path = getVersionDashboardPath(url);

		const tab: Tab = {
			id: generateId(),
			title:
				_.capitalize(item.type) === TabTypes.Field ? (item.meta.modelName as string) : item.name,
			path,
			isActive: true,
			isDashboard: false,
			isDirty: false,
			type: _.capitalize(item.type) as TabTypes,
		};
		addTab(versionId, tab);
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	}
	return handleClickElement;
}
