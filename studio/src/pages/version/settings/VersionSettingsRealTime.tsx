import { SettingsContainer } from '@/features/version/SettingsContainer';
import { SettingsRealtime } from '@/features/version/SettingsRealtime';

export default function VersionSettingsRealTime() {
	return (
		<SettingsContainer pageTitle='Real Time'>
			<SettingsRealtime />
		</SettingsContainer>
	);
}
