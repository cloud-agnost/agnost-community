import { Toast, ToastClose, ToastProvider, ToastTitle, ToastViewport } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils';
import { Check, X } from '@phosphor-icons/react';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider duration={2500}>
			{toasts.map(function ({ id, title, action, ...props }) {
				return (
					<Toast
						key={id}
						{...props}
						className={cn(action === 'success' ? 'bg-surface-green' : 'bg-surface-red')}
					>
						<div
							className={cn(
								action === 'success' ? 'bg-elements-strong-green' : 'bg-elements-red',
								'h-5 w-5 rounded-full flex items-center justify-center text-default',
							)}
						>
							{action === 'success' && <Check size={14} weight='bold' color='white' />}
							{action === 'error' && <X size={14} color='white' />}
						</div>
						{title && <ToastTitle className='flex-1'>{title}</ToastTitle>}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
