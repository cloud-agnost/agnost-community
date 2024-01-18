import { cn, copyToClipboard } from '@/utils';
import { Copy } from '@phosphor-icons/react';
import { Button } from '@/components/Button';

interface CopyButtonProps {
	text: string;
	className?: string;
}
export default function CopyButton({ text, className }: CopyButtonProps) {
	return (
		<Button
			onClick={() => copyToClipboard(text)}
			variant='blank'
			className={cn(
				'bg-button-secondary text-base w-7 h-7 p-[6px] hover:bg-button-secondary-hover border border-button-border hover:border-button-border-hover',
				className,
			)}
			iconOnly
		>
			<Copy />
		</Button>
	);
}
