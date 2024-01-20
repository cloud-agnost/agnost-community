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
			className={cn('w-7 h-7 p-[6px] ', className)}
			variant='secondary'
		>
			<Copy />
		</Button>
	);
}
