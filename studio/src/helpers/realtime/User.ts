import { RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class User extends RealtimeActions<User> {
	delete({ data, identifiers }: RealtimeActionParams<User>) {
		console.log(data, identifiers);
	}
	update({ data, identifiers }: RealtimeActionParams<User>) {
		console.log('----update user data------', data, identifiers);
	}
	create({ data, identifiers }: RealtimeActionParams<User>) {
		console.log(data, identifiers);
	}
	telemetry({ data, identifiers }: RealtimeActionParams<User>) {
		console.log(data, identifiers);
	}
}

export default User;
