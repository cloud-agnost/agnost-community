import ChangeAppAvatar from './General/ChangeAppAvatar';
import ChangeAppName from './General/ChangeAppName';
import TransferApp from './General/TransferApp';

export default function AppGeneralSettings() {
	return (
		<div className='space-y-6'>
			<ChangeAppName />
			<ChangeAppAvatar />
			<TransferApp />
		</div>
	);
}
