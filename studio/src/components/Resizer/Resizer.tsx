import { cn } from '@/utils';
import { useState } from 'react';
import { PanelResizeHandle, PanelResizeHandleProps } from 'react-resizable-panels';
import { Separator } from '../Separator';

interface ResizerProps extends PanelResizeHandleProps {
	hide?: boolean;
	orientation: 'horizontal' | 'vertical';
}
export default function Resizer({ hide, orientation, className, ...props }: ResizerProps) {
	const [isResizing, setIsResizing] = useState(false);
	return (
		<PanelResizeHandle
			{...props}
			className={cn(
				'flex items-center justify-center',
				orientation === 'horizontal' && 'flex-col',
				className,
			)}
			onDragging={(val) => {
				if (isResizing !== val) setIsResizing(val);
			}}
		>
			{!hide && (
				<>
					<div
						className={cn(
							'rounded h-8 w-0.5 bg-lighter',
							orientation === 'vertical' ? 'h-8 w-0.5' : 'h-0.5 w-8',
						)}
					/>
					<Separator
						className={cn(isResizing ? 'active-resizer' : 'bg-lighter')}
						orientation={orientation}
					/>
				</>
			)}
		</PanelResizeHandle>
	);
}
