import { SettingsContainer } from '@/features/version/SettingsContainer';
import { SettingsGeneral } from '@/features/version/SettingsGeneral';

export default function VersionSettingsGeneral() {
	return (
		<SettingsContainer pageTitle='General'>
			<SettingsGeneral />
		</SettingsContainer>
	);
}
