import useApplicationStore from '@/store/app/applicationStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Eye, EyeSlash, GearSix, GitBranch, GitFork, LockSimple } from '@phosphor-icons/react';
import { LockSimpleOpen } from '@phosphor-icons/react/dist/ssr';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useToast } from './useToast';
export default function useVersionDropdownItems() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const { openVersionDrawer } = useApplicationStore();
	const { appId, orgId } = useParams() as Record<string, string>;
	const {
		versions,
		version,
		setCreateCopyVersionDrawerIsOpen,
		updateVersionProperties,
		getAllVersionsVisibleToUser,
	} = useVersionStore();
	const { addSettingsTab } = useTabStore();

	useEffect(() => {
		if (appId && orgId) {
			getAllVersionsVisibleToUser({
				appId,
				orgId,
				page: 0,
				size: 2,
			});
		}
	}, [version]);
	const versionDropdownItems = useMemo(
		() => [
			{
				title: t('version.open_version'),
				action: () => {
					const application = useApplicationStore.getState().application;
					if (!application) return;
					openVersionDrawer(application);
				},
				disabled: versions.length <= 1,
				icon: GitBranch,
			},
			{
				title: t('version.create_a_copy'),
				action: () => setCreateCopyVersionDrawerIsOpen(true),
				icon: GitFork,
			},
			{
				title: version?.readOnly ? t('version.mark_read_write') : t('version.mark_read_only'),
				action: () => {
					if (!version) return;
					updateVersionProperties({
						orgId: version.orgId,
						versionId: version._id,
						appId: version.appId,
						readOnly: !version?.readOnly,
						onError: (error) => {
							toast({
								title: error.details,
								action: 'error',
							});
						},
					});
				},
				disabled: false,
				icon: !version?.readOnly ? LockSimple : LockSimpleOpen,
			},
			{
				title: version?.private ? t('version.set_public') : t('version.set_private'),
				action: () => {
					if (!version) return;
					updateVersionProperties({
						orgId: version.orgId,
						versionId: version._id,
						appId: version.appId,
						private: !version?.private,
						onError: (error) => {
							toast({
								title: error.details,
								action: 'error',
							});
						},
					});
				},
				disabled: version?.master,
				icon: !version?.private ? EyeSlash : Eye,
			},
			{
				title: t('version.settings.default'),
				action: () => addSettingsTab(version._id),
				disabled: false,
				icon: GearSix,
			},
		],
		[versions, version],
	);

	return versionDropdownItems;
}
