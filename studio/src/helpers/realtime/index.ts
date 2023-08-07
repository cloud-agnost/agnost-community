import { RealtimeObjectTypes } from '@/types';
import Application from './Application';
import Endpoint from './Endpoint';
import Organization from './Organization';
import Queue from './Queue';
import Resource from './Resources';
import Task from './Task';
import User from './User';

export function realtimeObjectMapper(type: RealtimeObjectTypes) {
	const keys = {
		user: User,
		org: Organization,
		'org.app': Application,
		'org.resource': Resource,
		app: Application,
		resource: Resource,
		queue: Queue,
		'org.app.version.queue': Queue,
		task: Task,
		'org.app.version.task': Task,
		endpoint: Endpoint,
	};
	return new keys[type]();
}
