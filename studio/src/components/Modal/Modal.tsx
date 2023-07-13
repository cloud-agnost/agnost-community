import { Button } from '@/components/Button';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { MouseEvent, ReactNode, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';
import './Modal.scss';
import { createPortal } from 'react-dom';

export interface ModalProps {
	title?: string | null;
	children?: ReactNode;
	className?: string;
	isOpen: boolean;
	closeModal: () => void;
	closeOnOverlayClick?: boolean;
	parentClassNames?: string;
}
export default function Modal({
	title,
	children,
	className,
	isOpen = false,
	parentClassNames,
	closeModal = () => {
		return;
	},
	closeOnOverlayClick = false,
}: ModalProps) {
	const modalOverlay = useRef(null);

	function handleEsc(event: KeyboardEvent | ReactKeyboardEvent<HTMLDivElement>) {
		if (event.key === 'Escape') closeModal();
	}

	const clickOutside = (event: MouseEvent) => {
		if (!closeOnOverlayClick) return;
		if (modalOverlay?.current === event.target) closeModal();
	};

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
				<div
					role='dialog'
					ref={modalOverlay}
					className={cn('modal pointer-events-auto', parentClassNames)}
					onClick={isOpen ? clickOutside : undefined}
					onKeyDown={handleEsc}
					aria-hidden={!isOpen}
				>
					<motion.div
						initial={{ scale: '0', opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0, opacity: 0 }}
						transition={{ type: 'tween' }}
						className={cn('modal-body', className)}
					>
						<div className=''>
							{title ? (
								<div className='modal-header'>
									<h5 className='modal-title'>{title}</h5>
									<Button
										size='sm'
										onClick={closeModal}
										className='modal-close'
										variant='text'
										rounded
									>
										<X size={24} />
									</Button>
								</div>
							) : (
								<Button
									size='sm'
									onClick={closeModal}
									className='modal-close'
									variant='text'
									rounded
								>
									<X size={24} />
								</Button>
							)}
							<div className='modal-content'>{children}</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
