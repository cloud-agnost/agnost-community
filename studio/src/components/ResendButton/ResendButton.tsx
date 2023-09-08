import { EnvelopeSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';

interface Props {
	onResend: () => void;
	disabled?: boolean;
}
export default function ResendButton({ onResend, disabled }: Props) {
	const { t } = useTranslation();

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant='blank' iconOnly onClick={onResend} disabled={disabled}>
						<EnvelopeSimple size={24} className='text-icon-base' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>{t('general.resend_invite')}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
