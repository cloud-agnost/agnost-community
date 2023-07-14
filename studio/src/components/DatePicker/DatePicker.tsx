import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from 'components/Popover';
import { Button } from 'components/Button';
import { cn } from '@/utils';
import { Calendar } from 'components/Calendar';
import { CalendarBlank } from '@phosphor-icons/react';
import { CalendarProps } from 'components/Calendar/Calendar.tsx';
import { useTranslation } from 'react-i18next';

export type DatePickerProps = CalendarProps & {
	className?: string;
	error?: boolean;
};
export default function DatePicker({ className, error, ...props }: DatePickerProps) {
	const { t } = useTranslation();
	const formatted = (
		<span className={cn('text-subtle text-sm', props.selected && 'text-default')}>
			{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
			{/*@ts-ignore*/}
			{props.selected ? format(props.selected, 'PPP') : t('forms.pick_a_date')}
		</span>
	);
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-full justify-start text-left font-normal',
						!props.selected && 'text-muted-foreground',
					)}
				>
					<CalendarBlank className='mr-2 h-4 w-4' />
					{formatted}
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn('w-auto p-0', error && 'error', className)}>
				<Calendar {...props} />
			</PopoverContent>
		</Popover>
	);
}
