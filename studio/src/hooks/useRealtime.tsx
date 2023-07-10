import { realtimeObjectMapper } from '@/helpers/realtime';
import useApplicationStore from '@/store/app/applicationStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import useVersionStore from '@/store/version/versionStore';
import { joinChannel, onChannelMessage } from '@/utils';
import { useEffect } from 'react';
export default function useRealtime() {
	const { organizations } = useOrganizationStore();
	const { applications } = useApplicationStore();
	const { versions } = useVersionStore();
	useEffect(() => {
		const cb = onChannelMessage('notification', (message) => {
			const { data, object, action, identifiers } = message;
			console.log('message', object, action, identifiers);
			const fn = realtimeObjectMapper(object);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore

			fn[action]({ data, identifiers });
		});

		organizations.forEach((organization) => {
			joinChannel(organization._id);
		});
		applications.forEach((application) => {
			joinChannel(application._id);
		});
		versions.forEach((version) => {
			joinChannel(version._id);
		});

		return () => {
			cb();
		};
	}, []);
}
