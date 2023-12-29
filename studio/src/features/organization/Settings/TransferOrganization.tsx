import { TransferOwnership } from '@/components/TransferOwnership';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useOrganizationStore from '@/store/organization/organizationStore';

export default function TransferOrganization() {
	const { transferOrganization } = useOrganizationStore();
	const canTransfer = useAuthorizeOrg('transfer');
	return <TransferOwnership transferFn={transferOrganization} type='org' disabled={!canTransfer} />;
}
