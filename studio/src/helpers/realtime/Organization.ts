import { Organization as OrganizationType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Organization extends RealtimeActions<OrganizationType> {
	delete({ data, identifiers }: RealtimeActionParams<OrganizationType>) {
		console.log(data, identifiers);
	}
	update({ data, identifiers }: RealtimeActionParams<OrganizationType>) {
		console.log(data, identifiers);
	}
	create({ data, identifiers }: RealtimeActionParams<OrganizationType>) {
		console.log(data, identifiers);
	}
}

export default Organization;
