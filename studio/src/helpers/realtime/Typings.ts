import { RealtimeActionParams } from '@/types';

class Typings {
	update({ data }: RealtimeActionParams<Record<string, string>>) {
		Object.entries(data).forEach(([key, value]) => {
			window.monaco?.languages.typescript.javascriptDefaults.addExtraLib(
				value as string,
				`file:///${key}`,
			);
		});
	}
}

export default Typings;
