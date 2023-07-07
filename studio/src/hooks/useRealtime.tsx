import { onChannelMessage } from '@/utils';
import { useEffect } from 'react';
import { realtimeObjectMapper } from '@/helpers/realtime';
export default function useRealtime() {
	useEffect(() => {
		const cb = onChannelMessage('notification', (message) => {
			const { data, object, action, identifiers } = message;
			const fn = realtimeObjectMapper(object);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			fn[action]({ data, identifiers });
		});

		return () => {
			cb();
		};
	}, []);
}
