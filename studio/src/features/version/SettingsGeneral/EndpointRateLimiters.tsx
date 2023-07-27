import { SortableRateLimits } from '@/features/version/SettingsGeneral';
import useVersionStore from '@/store/version/versionStore.ts';
import { reorder } from '@/utils';
import { DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';
import { APIError, RateLimit } from '@/types';
import { useState } from 'react';
export default function EndpointRateLimiters() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [deleting, setDeleting] = useState(false);
	const defaultEndpointLimits = useVersionStore((state) => state.version?.defaultEndpointLimits);
	const defaultRateLimiters = useVersionStore((state) => state.version?.defaultEndpointLimits);
	const updateVersionProperties = useVersionStore((state) => state.updateVersionProperties);
	const rateLimits = useVersionStore((state) => state.version?.limits);

	const rateLimitsNotInDefault = rateLimits?.filter(
		(item) => !defaultRateLimiters?.includes(item.iid),
	);
	const orderLimits = useVersionStore((state) => state.orderEndpointRateLimits);
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
		});
	}

	async function addToDefault(limiter: RateLimit) {
		if (!defaultRateLimiters || !versionId || !appId || !orgId) return;
		try {
			await updateVersionProperties({
				orgId,
				versionId,
				appId,
				defaultEndpointLimits: [...(defaultRateLimiters ?? []), limiter.iid],
			});
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('version.limiter_added_to_default'),
			});
		} catch (e) {
			const error = e as APIError;
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		}
	}

	async function deleteHandler(limitId?: string) {
		if (!versionId || !appId || !orgId || deleting || !limitId) return;
		try {
			setDeleting(true);
			await updateVersionProperties({
				orgId,
				versionId,
				appId,
				defaultEndpointLimits: defaultEndpointLimits?.filter((item) => item !== limitId),
			});
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('version.default_limiter_deleted'),
			});
		} catch (e) {
			const error = e as APIError;
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		} finally {
			setDeleting(false);
		}
	}

	if (
		!defaultRateLimiters ||
		!rateLimits ||
		defaultRateLimiters.length === 0 ||
		rateLimits.length === 0
	)
		return <></>;
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
