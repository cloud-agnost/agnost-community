import { Button } from '@/components/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuTrigger,
} from '@/components/Dropdown';
import { CRON_EXAMPLES } from '@/constants';
import { CreateTaskSchema } from '@/types';
import { describeCronExpression } from '@/utils';
import { CaretDown } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

export default function CronExamples() {
	const form = useFormContext<z.infer<typeof CreateTaskSchema>>();

	function selectCron(cron: string) {
		form.setValue('cronExpression', cron);
	}
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger className='absolute top-1 right-2'>
				<Button variant='icon' size='sm' rounded>
					<CaretDown size={14} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='start'
				className='w-[687px] absolute top-1 -right-9 bg-input-background'
			>
				<DropdownMenuItemContainer className='w-full bg-input-background '>
					{CRON_EXAMPLES.map((cron) => (
						<DropdownMenuItem
							key={cron}
							className='space-x-4 hover:bg-subtle'
							onClick={() => selectCron(cron)}
						>
							<span className='text-default text-xs'>{cron}</span>
							<span className='text-subtle text-xs'>{describeCronExpression(cron)}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
