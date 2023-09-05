import { Button } from '@/components/Button';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
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
	contentClassNames?: string;
	hideHeader?: boolean;
	closeOnEsc?: boolean;
}
export default function Modal({
	title,
	children,
	className,
	isOpen = false,
	parentClassNames,
	closeModal,
	contentClassNames,
	closeOnOverlayClick = false,
	closeOnEsc = false,
	hideHeader = false,
}: ModalProps) {
	const modalOverlay = useRef(null);

	function handleEsc(event: KeyboardEvent | ReactKeyboardEvent<HTMLDivElement>) {
		if (!closeOnEsc) return;
		if (event.key === 'Escape') closeModal();
	}

	const clickOutside = (event: MouseEvent) => {
		if (!closeOnOverlayClick) return;
		if (modalOverlay?.current === event.target) closeModal();
	};

	return createPortal(
		<>
			{isOpen && (
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
				<div
					role='dialog'
					ref={modalOverlay}
					className={cn('modal', parentClassNames)}
					onClick={isOpen ? clickOutside : undefined}
					onKeyDown={handleEsc}
					aria-hidden={!isOpen}
				>
					<div className={cn('modal-body', className)}>
						<div>
							{!hideHeader &&
								(title ? (
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
								))}
							<div className={cn('modal-content', hideHeader && 'no-header', contentClassNames)}>
								{children}
							</div>
						</div>
					</div>
				</div>
			)}
		</>,
		document.body,
	);
}
