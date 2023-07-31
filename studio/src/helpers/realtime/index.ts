import { RealtimeObjectTypes } from '@/types';
import Application from './Application';
import Organization from './Organization';
import Resource from './Resources';
import User from './User';

export function realtimeObjectMapper(type: RealtimeObjectTypes) {
	const keys = {
		user: User,
		org: Organization,
		'org.app': Application,
		'org.resource': Resource,
	};

	return new keys[type]();
}
