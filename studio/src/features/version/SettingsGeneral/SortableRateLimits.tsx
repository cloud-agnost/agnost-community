import { Sortable, SortableContainer, SortableItem } from '@/components/Sortable';
import useVersionStore from '@/store/version/versionStore.ts';
import { RateLimit } from '@/types';
import { Draggable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { AddRateLimiterDropdown } from '.';
interface SortableRateLimitsProps {
	onDragEnd: (result: DropResult) => void;
	onSelect: (limiter: RateLimit) => void;
	onDeleteItem: (id: string) => void;
	options: RateLimit[] | undefined;
	selectedLimits: string[];
	loading?: boolean;
	form?: boolean;
}

export default function SortableRateLimits({
	onDragEnd,
	onSelect,
	onDeleteItem,
	loading,
	options,
	selectedLimits,
	form,
}: SortableRateLimitsProps) {
	const { t } = useTranslation();
	const rateLimits = useVersionStore((state) => state.version?.limits);

	return (
		<SortableContainer
			title={t('version.rate_limiters')}
			actions={<AddRateLimiterDropdown options={options} onSelect={onSelect} form={form} />}
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
			</Sortable>
		</SortableContainer>
	);
}
