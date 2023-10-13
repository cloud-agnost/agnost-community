import { BADGE_COLOR_MAP } from '@/constants';
import { Log } from '@/types';
import { Badge } from '../Badge';
import { cn } from '@/utils';
import { useTranslation } from 'react-i18next';
interface LogsProps {
	logs: Log[];
	className?: string;
}

export default function Logs({ logs, className }: LogsProps) {
	const { t } = useTranslation();
	return (
		<div
			className={cn(
				'overflow-auto bg-base whitespace-pre text-default text-sm font-mono',
				className,
			)}
		>
			{logs?.length ? (
				logs?.map((log, index) => (
					<div key={index} className='grid grid-cols-[1fr,0.5fr,3fr] gap-6  px-4 py-2'>
						<p>{log.timestamp}</p>
						{log.type && (
							<Badge variant={BADGE_COLOR_MAP[log.type.toUpperCase()]} text={log.type} />
						)}
						<pre className='whitespace-pre-wrap'>{log.message}</pre>
					</div>
				))
			) : (
				<div className='flex items-center justify-center h-32'>
					<p>{t('general.no_logs')}</p>
				</div>
			)}
		</div>
	);
}
