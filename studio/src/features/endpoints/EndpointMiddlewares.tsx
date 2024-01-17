import { Sortable, SortableContainer, SortableItem } from '@/components/Sortable';
import useMiddlewareStore from '@/store/middleware/middlewareStore';
import { Middleware } from '@/types';
import { reorder } from '@/utils';
import { CaretDown, CaretUp, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { useState } from 'react';
import { Draggable, DropResult } from 'react-beautiful-dnd';
import { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { CreateMiddleware } from '../version/Middlewares';
import { CreateEndpointSchema } from '@/types';

interface EndpointMiddlewaresProps {
	field: ControllerRenderProps<z.infer<typeof CreateEndpointSchema>, 'middlewares'>;
}
export default function EndpointMiddlewares({ field }: EndpointMiddlewaresProps) {
	const { t } = useTranslation();
	const middlewares = useMiddlewareStore((state) => state.middlewares);

	function onDragEnd(result: DropResult) {
		const ordered = reorder(
			field.value as string[],
			result.source.index,
			result?.destination?.index ?? 0,
		);
		field.onChange(ordered);
	}
	return (
		<SortableContainer
			title={t('version.middleware.default')}
			actions={<AddMiddlewareDropdown value={field.value as string[]} onChange={field.onChange} />}
		>
			<Sortable onDragEnd={onDragEnd}>
				{field.value && field.value?.length > 0 ? (
					field.value?.map((iid, index) => (
						<Draggable key={index} draggableId={index.toString()} index={index}>
							{(provided) => (
								<SortableItem<Middleware>
									item={middlewares.find((item) => item.iid === iid) as Middleware}
									provided={provided}
									onDelete={() => {
										const filtered = field.value?.filter((mw) => mw !== iid);
										field.onChange(filtered);
									}}
								/>
							)}
						</Draggable>
					))
				) : (
					<p className='text-default font-sfCompact text-sm text-center'>
						{t('version.middleware.empty')}
					</p>
				)}
			</Sortable>
		</SortableContainer>
	);
}

interface AddMiddlewareDropdownProps {
	value: string[];
	onChange: (value: string[]) => void;
}

function AddMiddlewareDropdown({ value, onChange }: AddMiddlewareDropdownProps) {
	const [addMiddlewareDropDownIsOpen, setAddMiddlewareDropDownIsOpen] = useState(false);
	const { middlewares, toggleCreateModal } = useMiddlewareStore();
	const { t } = useTranslation();
	return (
		<>
			<DropdownMenu
				open={addMiddlewareDropDownIsOpen}
				onOpenChange={setAddMiddlewareDropDownIsOpen}
			>
				<DropdownMenuTrigger asChild>
					<Button variant='secondary' className='flex items-center gap-[10px]'>
						<Plus weight='bold' className='text-base' />
						{t('version.middleware.add_middleware')}
						{addMiddlewareDropDownIsOpen ? (
							<CaretUp weight='bold' className='text-base' />
						) : (
							<CaretDown weight='bold' className='text-base' />
						)}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end' className='version-dropdown-content'>
					<DropdownMenuItemContainer>
						<DropdownMenuItem
							onClick={toggleCreateModal}
							className='flex gap-[10px] text-default text-sm font-medium'
						>
							<Plus weight='bold' />
							<span>{t('version.middleware.add_middleware')}</span>
						</DropdownMenuItem>
						{middlewares && middlewares.length > 1 && <DropdownMenuSeparator />}

						{middlewares
							.filter((mw) => !value?.includes(mw.iid))
							?.map((mw, index) => (
								<DropdownMenuItem
									onClick={() => {
										if (value) onChange([...value, mw.iid]);
										else onChange([mw.iid]);
									}}
									key={index}
								>
									<div className='flex flex-col'>
										<span>{mw.name}</span>
									</div>
								</DropdownMenuItem>
							))}
					</DropdownMenuItemContainer>
				</DropdownMenuContent>
			</DropdownMenu>
			<CreateMiddleware
				onCreate={(mw) => {
					if (value) onChange([...value, mw.iid]);
					else onChange([mw.iid]);
				}}
			/>
		</>
	);
}
