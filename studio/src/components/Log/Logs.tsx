import { BADGE_COLOR_MAP } from '@/constants';
import { Log } from '@/types';
import { Badge } from '../Badge';

interface LogsProps {
	logs: Log[];
}

export default function Logs({ logs }: LogsProps) {
	return (
		<div className='overflow-auto bg-base'>
			{logs?.map((log, index) => (
				<div
					key={index}
					className='flex items-center gap-6 text-default text-sm font-mono space-y-2 p-4'
				>
					<p>{log.timestamp}</p>
					{log.type && <Badge variant={BADGE_COLOR_MAP[log.type.toUpperCase()]} text={log.type} />}
					<p className='whitespace-pre-wrap'>{log.message}</p>
				</div>
			))}
		</div>
	);
}
