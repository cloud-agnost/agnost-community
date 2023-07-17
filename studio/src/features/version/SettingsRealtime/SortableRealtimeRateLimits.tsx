import useVersionStore from '@/store/version/versionStore.ts';
import { DragDropContext, Draggable, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from 'components/StrictModeDroppable';
import { APIError, RateLimit } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';
import { DotsSixVertical, Trash } from '@phosphor-icons/react';
import { Button } from 'components/Button';

export default function SortableRealtimeRateLimits() {
	const realtimeRateLimiters = useVersionStore((state) => state.version?.realtime.rateLimits);
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const updateVersionRealtimeProperties = useVersionStore(
		(state) => state.updateVersionRealtimeProperties,
	);
	const orderLimits = useVersionStore((state) => state.orderRealtimeRateLimits);
	const version = useVersionStore((state) => state.version);

	const reorder = (list: string[], startIndex: number, endIndex: number) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	async function onDragEnd(result: DropResult) {
		if (!result.destination || !realtimeRateLimiters || !version) return;
		const ordered = reorder(realtimeRateLimiters, result.source.index, result.destination.index);
		orderLimits(ordered);
		await updateVersionRealtimeProperties({
			orgId: version.orgId,
			versionId: version._id,
			appId: version.appId,
			rateLimits: ordered,
		});
	}

	if (
		!realtimeRateLimiters ||
		!rateLimits ||
		realtimeRateLimiters.length === 0 ||
		rateLimits.length === 0
	)
		return <></>;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId='rate-limits'>
				{(provided) => (
					<div {...provided.droppableProps} ref={provided.innerRef}>
						<ul className='flex flex-col gap-4'>
							{realtimeRateLimiters?.map((iid, index) => (
								<Draggable key={index} draggableId={index.toString()} index={index}>
									{(provided) => (
										<RateLimitItem
											limiter={rateLimits?.find((item) => item.iid === iid)}
											provided={provided}
										/>
									)}
								</Draggable>
							))}
						</ul>
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
}

interface RateLimitProps {
	provided: DraggableProvided;
	limiter?: RateLimit;
}
function RateLimitItem({ provided, limiter }: RateLimitProps) {
	const [deleting, setDeleting] = useState(false);
	const realtimeRateLimitsRateLimits = useVersionStore(
		(state) => state.version?.realtime.rateLimits,
	);
	const updateVersionRealtimeProperties = useVersionStore(
		(state) => state.updateVersionRealtimeProperties,
	);
	const { t } = useTranslation();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const { notify } = useToast();

	async function deleteHandler(limitId?: string) {
		if (!versionId || !appId || !orgId || deleting || !limitId) return;
		try {
			setDeleting(true);
			await updateVersionRealtimeProperties({
				orgId,
				versionId,
				appId,
				rateLimits: realtimeRateLimitsRateLimits?.filter((item) => item !== limitId),
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
		<li
			className='p-2 flex items-center gap-2 rounded bg-subtle text-default text-sm font-sfCompact leading-6 font-normal'
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
		>
			<DotsSixVertical className='text-icon-base text-lg cursor-move' />
			<span>{limiter?.name}</span>
			<Button
				onClick={() => deleteHandler(limiter?.iid)}
				iconOnly
				loading={deleting}
				variant='blank'
				rounded
				className='ml-auto text-lg text-icon-base aspect-square hover:bg-base hover:text-default'
			>
				<Trash />
			</Button>
		</li>
	);
}
