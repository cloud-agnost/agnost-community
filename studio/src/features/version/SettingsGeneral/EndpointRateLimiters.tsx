import { SortableRateLimits } from '@/features/version/SettingsGeneral';
import { useToast } from '@/hooks';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { RateLimit } from '@/types';
import { reorder } from '@/utils';
import { useState } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
export default function EndpointRateLimiters() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [deleting, setDeleting] = useState(false);
	const defaultEndpointLimits = useVersionStore((state) => state.version?.defaultEndpointLimits);
	const defaultRateLimiters = useVersionStore(
		(state) => state.version?.defaultEndpointLimits ?? [],
	);
	const updateVersionProperties = useVersionStore((state) => state.updateVersionProperties);
	const rateLimits = useVersionStore((state) => state.version?.limits);

	const rateLimitsNotInDefault = rateLimits?.filter(
		(item) => !defaultRateLimiters?.includes(item.iid),
	);
	const orderLimits = useSettingsStore((state) => state.orderEndpointRateLimits);
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	async function onDragEnd(result: DropResult) {
		if (!result.destination || !defaultRateLimiters || !versionId || !appId || !orgId) return;
		const ordered = reorder(defaultRateLimiters, result.source.index, result.destination.index);
		orderLimits(ordered);
		await updateVersionProperties({
			orgId,
			versionId,
			appId,
			defaultEndpointLimits: ordered,
			onError: (error) => {
				notify({
					type: 'error',
					title: t('general.error'),
					description: error.details,
				});
			},
		});
	}

	async function addToDefault(limiter: RateLimit) {
		if (!defaultRateLimiters || !versionId || !appId || !orgId) return;
		updateVersionProperties({
			orgId,
			versionId,
			appId,
			defaultEndpointLimits: [...(defaultRateLimiters ?? []), limiter.iid],
			onSuccess: () => {
				notify({
					type: 'success',
					title: t('general.success'),
					description: t('version.limiter_added_to_default'),
				});
			},
			onError: (error) => {
				notify({
					type: 'error',
					title: t('general.error'),
					description: error.details,
				});
			},
		});
	}

	async function deleteHandler(limitId?: string) {
		if (!versionId || !appId || !orgId || deleting || !limitId) return;

		setDeleting(true);
		updateVersionProperties({
			orgId,
			versionId,
			appId,
			defaultEndpointLimits: defaultEndpointLimits?.filter((item) => item !== limitId),
			onSuccess: () => {
				notify({
					type: 'success',
					title: t('general.success'),
					description: t('version.limiter_added_to_default'),
				});
				setDeleting(false);
			},
			onError: (error) => {
				notify({
					type: 'error',
					title: t('general.error'),
					description: error.details,
				});
				setDeleting(false);
			},
		});
	}

	return (
		<SortableRateLimits
			onDragEnd={onDragEnd}
			options={rateLimitsNotInDefault}
			onSelect={addToDefault}
			selectedLimits={defaultRateLimiters}
			onDeleteItem={(limitId: string) => deleteHandler(limitId)}
			loading={deleting}
			hasToAddAsDefault='endpoint'
		/>
	);
}
