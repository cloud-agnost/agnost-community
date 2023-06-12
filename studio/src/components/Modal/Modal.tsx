import { useEffect, useRef, ReactNode, MouseEvent, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/Button';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import './Modal.scss';

interface ModalProps {
	children: ReactNode;
	className?: string;
	isOpen: boolean;
	closeModal: () => void;
	closeOnOverlayClick?: boolean;
}
export default function Modal({
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
							<X className='h-4 w-4 text-icon-base' />
						</Button>
						<div>{children}</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

Modal.Demo = function () {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<Button onClick={() => setIsOpen(true)}>Open Modal</Button>
			<Modal isOpen={isOpen} closeModal={() => setIsOpen(false)}>
				<p className='text-default'>Özgür ÖZALP</p>
			</Modal>
		</div>
	);
};
