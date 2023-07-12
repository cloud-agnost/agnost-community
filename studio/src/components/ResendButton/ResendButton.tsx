import React from 'react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Button } from '../Button';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
interface Props {
	onResend: () => void;
}
export default function ResendButton({ onResend }: Props) {
	const { t } = useTranslation();
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button variant='blank' iconOnly onClick={onResend}>
						<EnvelopeSimple size={24} className='text-icon-base' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>{t('general.resend_invite')}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
