import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../Tooltip';
import { Button } from '../Button';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import { AppRoles } from '@/types';

interface Props {
	onResend: () => void;
	disabled?: boolean;
	role?: string;
	permissionKey?: string;
}
export default function ResendButton({ onResend, disabled, permissionKey, role }: Props) {
	const { t } = useTranslation();
	const hasAppPermission = useAuthorizeApp({
		key: permissionKey as string,
		role: role as AppRoles,
	});
	const hasOrgPermission = useAuthorizeOrg(permissionKey as string);
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger disabled={disabled}>
					<Button
						variant='blank'
						iconOnly
						onClick={onResend}
						disabled={disabled || !hasAppPermission || !hasOrgPermission}
					>
						<EnvelopeSimple size={24} className='text-icon-base' />
					</Button>
				</TooltipTrigger>
				<TooltipContent>{t('general.resend_invite')}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
