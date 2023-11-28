import { SortableRateLimits } from '@/features/version/SettingsGeneral';
import { useToast } from '@/hooks';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError, RateLimit, Version } from '@/types';
import { reorder } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { DropResult } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';

export default function RealtimeRateLimits() {
	const { notify } = useToast();
	const { updateVersionRealtimeProperties } = useSettingsStore();
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const realtime = useVersionStore((state) => state.version?.realtime);
	const realtimeEndpoints = useVersionStore((state) => state.version?.realtime?.rateLimits ?? []);
	const orderLimits = useSettingsStore((state) => state.orderRealtimeRateLimits);

	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const rateLimitsNotInDefault = rateLimits?.filter(
		(item) => !realtimeEndpoints?.includes(item.iid),
	);
	function handleUpdateVersionRealtimeProperties(rateLimits: string[]): Promise<Version> {
		return updateVersionRealtimeProperties({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			...realtime,
			rateLimits,
		});
	}
	const { mutateAsync: updateVersionMutate, isPending } = useMutation({
		mutationFn: handleUpdateVersionRealtimeProperties,
		onError: (error: APIError) => {
			notify({
				type: 'error',
				title: error.error,
				description: error.details,
			});
		},
	});
	async function onDragEnd(result: DropResult) {
		if (!result.destination || !realtimeEndpoints) return;
		const ordered = reorder(realtimeEndpoints, result.source.index, result.destination.index);
		orderLimits(ordered);
		updateVersionMutate(ordered);
	}

	function addToDefault(limiter: RateLimit) {
		updateVersionMutate([...(realtimeEndpoints ?? []), limiter.iid]);
	}

	async function deleteHandler(limitId?: string) {
		if (!limitId) return;
		updateVersionMutate(realtimeEndpoints?.filter((item) => item !== limitId));
	}

	return (
		<SortableRateLimits
			onDragEnd={onDragEnd}
			options={rateLimitsNotInDefault}
			onSelect={addToDefault}
			selectedLimits={realtimeEndpoints}
			onDeleteItem={(limitId: string) => deleteHandler(limitId)}
			loading={isPending}
			hasToAddAsDefault='realtime'
		/>
	);
}
