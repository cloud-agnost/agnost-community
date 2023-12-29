import { TransferOwnership } from '@/components/TransferOwnership';
import useOrganizationStore from '@/store/organization/organizationStore';

export default function TransferOrganization() {
	const { transferOrganization } = useOrganizationStore();
	return <TransferOwnership transferFn={transferOrganization} type='org' />;
}
