import { realtimeObjectMapper } from '@/helpers/realtime';
import { onChannelMessage } from '@/utils';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
export default function useRealtime() {
	useEffect(() => {
		const cb = onChannelMessage('notification', (message) => {
			const { data, object, action, identifiers, objecType, timestamp, message: log, id } = message;
			const fn = realtimeObjectMapper(object ?? objecType);
			console.log('realtime', message);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			fn[action ?? 'info']({
				data,
				identifiers,
				timestamp: DateTime.fromISO(timestamp)
					.setLocale('en')
					.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
				message: log,
				id,
			});
		});

		return () => {
			cb();
		};
	}, []);
}
