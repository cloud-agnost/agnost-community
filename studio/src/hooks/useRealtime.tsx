import { NOTIFICATION_ACTIONS } from '@/constants';
import { realtimeObjectMapper } from '@/helpers/realtime';
import useAuthStore from '@/store/auth/authStore';
import useVersionStore from '@/store/version/versionStore';
import { NotificationActions } from '@/types';
import { DATE_TIME_FORMAT, generateId, onChannelMessage, formatDate } from '@/utils';
import { useEffect } from 'react';

export default function useRealtime() {
	const user = useAuthStore((state) => state.user);
	useEffect(() => {
		const cb = onChannelMessage('notification', (message) => {
			const { data, object, action, identifiers, timestamp, message: log, id, type } = message;
			if (message?.actor?.userId !== user?._id || action !== 'create') {
				const fn = realtimeObjectMapper(object);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				fn[action]({
					data,
					identifiers,
					timestamp: formatDate(timestamp, DATE_TIME_FORMAT),
					message: log,
					...(id && { id }),
					type,
					actor: message.actor,
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
