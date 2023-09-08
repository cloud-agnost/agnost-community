interface LogsProps {
	logs: string[];
}

export default function Logs({ logs }: LogsProps) {
	return (
		<div className='text-default text-sm font-mono bg-base p-4 space-y-2 overflow-auto'>
			{logs?.map((log) => <p key={log}>{log}</p>)}
		</div>
	);
}
