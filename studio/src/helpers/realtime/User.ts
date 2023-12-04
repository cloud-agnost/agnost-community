import useAuthStore from '@/store/auth/authStore';
import { RealtimeActionParams, User as UserType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class User extends RealtimeActions<UserType> {
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log(): void {
		throw new Error('Method not implemented.');
	}
	delete({ data, identifiers }: RealtimeActionParams<UserType>) {
		console.log(data, identifiers);
	}
	update({ data }: RealtimeActionParams<UserType>) {
		useAuthStore.setState({ user: data });
	}
	create({ data, identifiers }: RealtimeActionParams<UserType>) {
		console.log(data, identifiers);
	}
	telemetry({ data, identifiers }: RealtimeActionParams<UserType>) {
		console.log(data, identifiers);
	}
}

export default User;
