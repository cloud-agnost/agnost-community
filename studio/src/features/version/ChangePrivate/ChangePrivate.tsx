import useVersionStore from '@/store/version/versionStore.ts';
import { Switch } from 'components/Switch';

export default function ChangePrivate() {
	const { version } = useVersionStore();
	return (
		<>
			<Switch defaultChecked={version?.private} />
		</>
	);
}
