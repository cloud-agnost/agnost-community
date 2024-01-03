import { Toast, ToastClose, ToastProvider, ToastTitle, ToastViewport } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/utils';
import { Check, X } from '@phosphor-icons/react';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider duration={2500}>
			{toasts.map(function ({ id, title, variant, action, ...props }) {
				return (
					<Toast key={id} {...props}>
						<div
							className={cn(
								action === 'success' ? 'bg-elements-strong-green' : 'bg-elements-red',
								'h-6 w-6 rounded-full flex items-center justify-center text-default',
							)}
						>
							{action === 'success' && <Check size={16} weight='bold' />}
							{action === 'error' && <X size={16} />}
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
