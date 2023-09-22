import { NOTIFICATION_ACTIONS } from '@/constants';
import { realtimeObjectMapper } from '@/helpers/realtime';
import useAuthStore from '@/store/auth/authStore';
import useVersionStore from '@/store/version/versionStore';
import { NotificationActions } from '@/types';
import { generateId, onChannelMessage } from '@/utils';
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
					timestamp: DateTime.fromISO(timestamp).toFormat('yyyy-MM-dd hh:mm:ss'),
					message: log,
					id,
					type,
				});
				if (NOTIFICATION_ACTIONS.includes(action)) {
					useVersionStore.setState({
						notificationsPreview: [
							{
								_id: generateId(),
								...identifiers,
								orgId: identifiers.orgId as string,
								appId: identifiers.appId as string,
								versionId: identifiers.versionId as string,
								object,
								action: action as NotificationActions,
								actor: message.actor,
								description: message.description,
								data,
								createdAt: new Date(timestamp).toISOString(),
								__v: 0,
							},
							...useVersionStore.getState().notificationsPreview,
						],
					});
				}
			}
		});

		return () => {
			cb();
		};
	}, []);
}
