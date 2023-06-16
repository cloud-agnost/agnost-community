import { Button } from '@/components/Button';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import './Modal.scss';

export interface ModalProps {
	title?: string | null;
	children?: ReactNode;
	className?: string;
	isOpen: boolean;
	closeModal: () => void;
	closeOnOverlayClick?: boolean;
}
export default function Modal({
	title,
	children,
	className,
	isOpen = false,
	closeModal = () => {},
	closeOnOverlayClick = false,
}: ModalProps) {
	const modalOverlay = useRef(null);

	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeModal();
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, []);

	const clickOutside = (event: MouseEvent) => {
		if (!closeOnOverlayClick) return;
		if (modalOverlay?.current === event.target) closeModal();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div ref={modalOverlay} className='modal open' onClick={clickOutside}>
					<motion.div
						initial={{ scale: '0', opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{ type: 'tween' }}
						className={cn('modal-body', className)}
					>
						<Button size='sm' onClick={closeModal} className='modal-close' variant='link'>
							<X size={24} className='text-icon-base' />
						</Button>

						<div className='space-y-4'>
							{title && <h5 className='modal-title'>{title}</h5>}
							{children}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
