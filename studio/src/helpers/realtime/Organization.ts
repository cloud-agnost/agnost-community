import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization as OrganizationType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Organization extends RealtimeActions<OrganizationType> {
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log(): void {
		throw new Error('Method not implemented.');
	}
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
	telemetry(params: RealtimeActionParams<OrganizationType>) {
		this.update(params);
	}
}

export default Organization;
