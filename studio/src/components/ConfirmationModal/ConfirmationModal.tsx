import { Modal, ModalProps } from 'components/Modal';
import { Button } from 'components/Button';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './confirmationModal.scss';
import { Input } from 'components/Input';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { APIError } from '@/types';

interface ConfirmationModalProps extends ModalProps {
	error?: APIError | null;
	title: string;
	alertTitle?: string | null;
	alertDescription?: string | null;
	description: string | ReactNode;
	action?: ReactNode;
	closable?: boolean;
	closeButtonText?: string;
	confirmCode: string;
	onConfirm: () => void;
	loading?: boolean;
	confirmButtonText?: string | null;
}
export default function ConfirmationModal({
	loading,
	error,
	closeModal,
	closeOnOverlayClick,
	isOpen,
	description,
	title,
	onConfirm,
	closable,
	className,
	confirmCode,
	closeButtonText,
	confirmButtonText,
	alertDescription,
	alertTitle,
}: ConfirmationModalProps) {
	const { t } = useTranslation();
	const [code, setCode] = useState<string>('');
	const showAlert = alertTitle || alertDescription;

	useEffect(() => {
		if (!isOpen) setCode('');
	}, [isOpen]);

	return (
		<Modal
			closeModal={closeModal}
			className={className}
			title={title}
			closeOnOverlayClick={closeOnOverlayClick}
			isOpen={isOpen}
		>
			<div className='confirmation-modal'>
				{error ? (
					<Alert variant='error'>
						{alertTitle && <AlertTitle>{error.error}</AlertTitle>}
						{alertDescription && <AlertDescription>{error.details}</AlertDescription>}
					</Alert>
				) : (
					showAlert && (
						<Alert variant='warning'>
							{alertTitle && <AlertTitle>{alertTitle}</AlertTitle>}
							{alertDescription && <AlertDescription>{alertDescription}</AlertDescription>}
						</Alert>
					)
				)}
				<p className='confirmation-modal-desc'>{description}</p>
				{confirmCode && (
					<Input
						value={code}
						placeholder={t('general.enter_confirmation_code_here') ?? ''}
						maxLength={confirmCode.length}
						onChange={(e) => setCode(e.target.value)}
					/>
				)}
				<div className='confirmation-modal-actions'>
					{closable && (
						<Button onClick={closeModal} variant='text' size='lg'>
							{closeButtonText ?? t('general.cancel')}
						</Button>
					)}
					<Button loading={loading} onClick={onConfirm} size='lg' disabled={code !== confirmCode}>
						{confirmButtonText ?? t('general.delete')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
