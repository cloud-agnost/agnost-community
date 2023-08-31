import { realtimeObjectMapper } from '@/helpers/realtime';
import useAuthStore from '@/store/auth/authStore';
import { onChannelMessage } from '@/utils';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
export default function useRealtime() {
	const user = useAuthStore((state) => state.user);
	useEffect(() => {
		const cb = onChannelMessage('notification', (message) => {
			const { data, object, action, identifiers, timestamp, message: log, id, type } = message;
			if (message?.actor?.userId !== user?._id || action !== 'create') {
				const fn = realtimeObjectMapper(object);
				fn[action]({
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					data,
					identifiers,
					timestamp: DateTime.fromISO(timestamp)
						.setLocale('en')
						.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
					message: log,
					id,
					type,
				});
			}
		});

		return () => {
			cb();
		};
	}, []);
}
