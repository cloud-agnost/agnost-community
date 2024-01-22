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
			className={cn('!p-1', className)}
			variant='icon'
			size='sm'
			rounded
		>
			<Copy />
		</Button>
	);
}
