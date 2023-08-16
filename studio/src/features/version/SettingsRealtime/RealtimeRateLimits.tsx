import { useTranslation } from 'react-i18next';
import { SortableRateLimits } from '@/features/version/SettingsGeneral';
import useVersionStore from '@/store/version/versionStore';
import { useParams } from 'react-router-dom';
import { APIError, RateLimit } from '@/types';
import { DropResult } from 'react-beautiful-dnd';
import { reorder } from '@/utils';
import { useState } from 'react';
import { useToast } from '@/hooks';

export default function RealtimeRateLimits() {
	const [deleting, setDeleting] = useState(false);
	const { notify } = useToast();
	const { t } = useTranslation();
	const { updateVersionRealtimeProperties } = useVersionStore();
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const realtimeEndpoints = useVersionStore((state) => state.version?.realtime?.rateLimits ?? []);
	const orderLimits = useVersionStore((state) => state.orderRealtimeRateLimits);

	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const rateLimitsNotInDefault = rateLimits?.filter(
		(item) => !realtimeEndpoints?.includes(item.iid),
	);

	async function onDragEnd(result: DropResult) {
		if (!result.destination || !realtimeEndpoints || !versionId || !appId || !orgId) return;
		const ordered = reorder(realtimeEndpoints, result.source.index, result.destination.index);
		orderLimits(ordered);

		await updateVersionRealtimeProperties({
			orgId,
			versionId,
			appId,
			rateLimits: ordered,
		});
	}

	function addToDefault(limiter: RateLimit) {
		updateVersionRealtimeProperties({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			rateLimits: [...(realtimeEndpoints ?? []), limiter.iid],
		});
	}

	async function deleteHandler(limitId?: string) {
		if (!versionId || !appId || !orgId || deleting || !limitId) return;
		try {
			setDeleting(true);
			await updateVersionRealtimeProperties({
				orgId,
				versionId,
				appId,
				rateLimits: realtimeEndpoints?.filter((item) => item !== limitId),
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

	return (
		<SortableRateLimits
			onDragEnd={onDragEnd}
			options={rateLimitsNotInDefault}
			onSelect={addToDefault}
			selectedLimits={realtimeEndpoints}
			onDeleteItem={(limitId: string) => deleteHandler(limitId)}
			loading={deleting}
			hasToAddAsDefault='realtime'
		/>
	);
}
