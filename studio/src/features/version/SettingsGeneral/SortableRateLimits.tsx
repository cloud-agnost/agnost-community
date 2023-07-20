import useVersionStore from '@/store/version/versionStore.ts';
import { DragDropContext, Draggable, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from 'components/StrictModeDroppable';
import { APIError, RateLimit } from '@/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddRateLimiterDropdown } from '.';
interface SortableRateLimitsProps {
	onDragEnd: (result: DropResult) => void;
	onSelect: (limiter: RateLimit) => void;
	onDeleteItem: (id: string) => void;
	options: RateLimit[] | undefined;
	selectedLimits: string[];
	loading?: boolean;
	hasToAddAsDefault?: 'endpoint' | 'realtime';
}

export default function SortableRateLimits({
	onDragEnd,
	onSelect,
	onDeleteItem,
	loading,
	options,
	selectedLimits,
	hasToAddAsDefault,
}: SortableRateLimitsProps) {
	const { t } = useTranslation();
	const rateLimits = useVersionStore((state) => state.version?.limits);
	const updateVersionProperties = useVersionStore((state) => state.updateVersionProperties);
	const orderLimits = useVersionStore((state) => state.orderLimits);
	const { orgId, versionId, appId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const reorder = (list: string[], startIndex: number, endIndex: number) => {
		const result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);

		return result;
	};

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

	if (
		!defaultRateLimiters ||
		!rateLimits ||
		defaultRateLimiters.length === 0 ||
		rateLimits.length === 0
	)
		return <></>;

	return (
		<SortableContainer
			title={t('version.rate_limiters')}
			actions={
				<AddRateLimiterDropdown
					options={options}
					onSelect={onSelect}
					hasToAddAsDefault={hasToAddAsDefault}
				/>
			}
		>
			<Sortable onDragEnd={onDragEnd}>
				{selectedLimits?.length > 0 ? (
					selectedLimits?.map((iid, index) => (
						<Draggable key={index} draggableId={index.toString()} index={index}>
							{(provided) => (
								<SortableItem<RateLimit>
									item={rateLimits?.find((item) => item.iid === iid) as RateLimit}
									provided={provided}
									onDelete={onDeleteItem}
									loading={loading}
								/>
							)}
						</Draggable>
					))
				) : (
					<p className='text-default font-sfCompact text-sm text-center'>
						{t('version.rate_limiters_empty')}
					</p>
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
	const defaultEndpointLimits = useVersionStore((state) => state.version?.defaultEndpointLimits);
	const updateVersionProperties = useVersionStore((state) => state.updateVersionProperties);
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
