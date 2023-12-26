import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TabTypes } from '@/types';
import { generateId } from '@/utils';
import useToast from './useToast';
import useTabStore from '@/store/version/tabStore';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { Eye, EyeSlash, GearSix, GitBranch, GitFork, LockSimple } from '@phosphor-icons/react';
import { LockSimpleOpen } from '@phosphor-icons/react/dist/ssr';
export default function useVersionDropdownItems() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { openVersionDrawer } = useApplicationStore();
	const { appId, orgId } = useParams() as Record<string, string>;
	const {
		versions,
		version,
		setCreateCopyVersionDrawerIsOpen,
		updateVersionProperties,
		getVersionDashboardPath,
		getAllVersionsVisibleToUser,
	} = useVersionStore();
	const { addTab } = useTabStore();

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
							notify({
								type: 'error',
								title: t('general.error'),
								description: error.details,
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
							notify({
								type: 'error',
								title: t('general.error'),
								description: error.details,
							});
						},
					});
				},
				disabled: version?.master,
				icon: !version?.private ? EyeSlash : Eye,
			},
			{
				title: t('version.settings.default'),
				action: () => {
					const versionHomePath = getVersionDashboardPath('/settings');
					addTab(version?._id, {
						id: generateId(),
						title: t('version.settings.default'),
						path: versionHomePath,
						isActive: true,
						isDashboard: false,
						type: TabTypes.Settings,
					});
				},
				disabled: false,
				icon: GearSix,
			},
		],
		[versions, version],
	);

	return versionDropdownItems;
}
