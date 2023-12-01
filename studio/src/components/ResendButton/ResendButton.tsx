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
					<Button
						variant='blank'
						rounded
						disabled={disabled}
						className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
						iconOnly
						onClick={onResend}
					>
						<EnvelopeSimple size={20} />
					</Button>
				</TooltipTrigger>
				<TooltipContent>{t('general.resend_invite')}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
