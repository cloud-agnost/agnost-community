import useVersionStore from '@/store/version/versionStore.ts';
import { DragDropContext, Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from 'components/StrictModeDroppable';
import { APIError, RateLimit } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';
import { DotsSixVertical, Trash } from '@phosphor-icons/react';
import { Button } from 'components/Button';

export default function SortableRateLimits() {
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const orderLimits = useVersionStore((state) => state.orderLimits);

	const reorder = (list: RateLimit[], startIndex: number, endIndex: number) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

	function onDragEnd(result: any) {
		if (!result.destination || !rateLimits) return;
		orderLimits(reorder(rateLimits, result.source.index, result.destination.index));
	}

	if (!rateLimits) return <></>;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId='rate-limits'>
				{(provided) => (
					<div {...provided.droppableProps} ref={provided.innerRef}>
						<ul className='flex flex-col gap-4'>
							{rateLimits?.map((limiter, index) => (
								<Draggable key={index} draggableId={index.toString()} index={index}>
									{(provided) => <RateLimitItem limiter={limiter} provided={provided} />}
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
	limiter: RateLimit;
}
function RateLimitItem({ provided, limiter }: RateLimitProps) {
	const [deleting, setDeleting] = useState(false);
	const deleteLimit = useVersionStore((state) => state.deleteRateLimit);
	const { t } = useTranslation();
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const { notify } = useToast();

	async function deleteHandler(limitId: string) {
		if (!versionId || !appId || !orgId || deleting) return;
		try {
			setDeleting(true);
			await deleteLimit({ orgId, versionId, appId, limitId });
			notify({
				type: 'success',
				title: t('general.success'),
				description: t('version.add.rate_limiter.deleted'),
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
			<span>{limiter.name}</span>
			<Button
				onClick={() => deleteHandler(limiter._id)}
				iconOnly
				loading={deleting}
				variant='blank'
				rounded
				className='ml-auto text-lg text-icon-base hover:bg-base hover:text-default'
			>
				<Trash />
			</Button>
		</li>
	);
}
