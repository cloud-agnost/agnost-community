import useVersionStore from '@/store/version/versionStore.ts';
import { Switch } from 'components/Switch';

export default function ChangeReadOnly() {
	const { version } = useVersionStore();
	return <Switch defaultChecked={version?.readOnly} />;
}
