import { RealtimeObjectTypes } from '@/types';
import Organization from './Organization';
import User from './User';

export function realtimeObjectMapper(type: RealtimeObjectTypes) {
	const keys = {
		user: User,
		organization: Organization,
	};
	return new keys[type]();
}
