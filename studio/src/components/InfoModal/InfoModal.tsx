import { Modal, ModalProps } from 'components/Modal';
import { Button } from 'components/Button';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './infoModal.scss';

interface InfoModalProps extends ModalProps {
	title: string;
	description: string;
	icon?: ReactNode;
	action?: ReactNode;
	closable?: boolean;
	closeButtonText?: string;
}
export default function InfoModal({
	closeModal,
	closeOnOverlayClick,
	isOpen,
	description,
	title,
	icon,
	action,
	closable,
	className,
	closeButtonText,
}: InfoModalProps) {
	const { t } = useTranslation();
	return (
		<Modal
			closeModal={closeModal}
			className={className}
			closeOnOverlayClick={closeOnOverlayClick}
			isOpen={isOpen}
		>
			<div className='info-modal'>
				{icon}
				<div className='info-modal-text'>
					<h2 className='info-modal-text-title'>{title}</h2>
					<p className='info-modal-text-desc'>{description}</p>
				</div>
				<div className='info-modal-actions'>
					{closable && (
						<Button variant='text' size='lg'>
							{closeButtonText ?? t('general.cancel')}
						</Button>
					)}
					{action}
				</div>
			</div>
		</Modal>
	);
}
