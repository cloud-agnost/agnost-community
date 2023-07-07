import { RealtimeActions } from './RealtimeActions';
import { RealtimeActionParams } from '@/types';
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
}

export default User;
