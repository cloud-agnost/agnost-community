import useVersionStore from '@/store/version/versionStore';
import { RealtimeActionParams } from '@/types';
import { addLibsToEditor } from '@/utils';

class Typings {
	update({ data }: RealtimeActionParams<Record<string, string>>) {
		addLibsToEditor(data);
		useVersionStore.setState((prev) => ({
			...prev,
			typings: {
				...prev.typings,
				...data,
			},
		}));
	}
}

export default Typings;
