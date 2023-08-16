interface LogsProps {
	logs: string[];
}

export default function Logs({ logs }: LogsProps) {
	return (
		<div className='text-default text-sm font-mono bg-wrapper-background-light p-4 space-y-2'>
			{logs?.map((log) => (
				<div key={log}>{log}</div>
			))}
		</div>
	);
}
