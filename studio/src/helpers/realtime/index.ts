import { RealtimeObjectTypes } from '@/types';
import Organization from './Organization';
import User from './User';
import Application from './Application';

export function realtimeObjectMapper(type: RealtimeObjectTypes) {
	const keys = {
		user: User,
		org: Organization,
		'org.app': Application,
	};
	// TODO: can you fix this?
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return new keys[type]();
}
