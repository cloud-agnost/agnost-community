import { Organization as OrganizationType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
import useOrganizationStore from '@/store/organization/organizationStore';
class Organization extends RealtimeActions<OrganizationType> {
	delete({ identifiers }: RealtimeActionParams<OrganizationType>) {
		useOrganizationStore.setState?.({
			organizations: useOrganizationStore
				.getState?.()
				.organizations.filter((org) => org._id !== identifiers.orgId),
		});
	}
	update({ data }: RealtimeActionParams<OrganizationType>) {
		useOrganizationStore.setState?.({
			organization: data,
			organizations: useOrganizationStore.getState?.().organizations.map((org) => {
				if (org._id === data._id) {
					return data;
				}
				return org;
			}),
		});
	}
	create({ data }: RealtimeActionParams<OrganizationType>) {
		useOrganizationStore.setState?.({
			organizations: [...useOrganizationStore.getState().organizations, data],
		});
	}
}

export default Organization;
