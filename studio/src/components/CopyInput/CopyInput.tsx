import { Input } from '@/components/Input';
import { cn } from '@/utils';
import { Copy } from '@phosphor-icons/react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import './copyInput.scss';
import { useToast } from '@/hooks';
import { useTranslation } from 'react-i18next';

const CopyInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
	({ className, value, readOnly, placeholder, ...props }, ref) => {
		const [inputValue, setInputValue] = useState<string>(value as string);
		const { notify } = useToast();
		const { t } = useTranslation();

		async function copy() {
			try {
				await navigator.clipboard.writeText(inputValue);
				notify({
					title: t('general.success'),
					description: t('general.copied'),
					type: 'success',
				});
			} catch (e) {
				notify({
					title: t('general.error'),
					description: t('general.copied_error'),
					type: 'error',
				});
			}
		}

		return (
			<div className={cn('copy-input-wrapper', className)} {...props}>
				<Input
					ref={ref}
					value={inputValue}
					readOnly={readOnly}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={placeholder}
					className='copy-input'
				/>
				<Button className='copy-input-button' onClick={copy} variant='blank' type='button'>
					<Copy size={20} />
				</Button>
			</div>
		);
	},
);
CopyInput.displayName = 'CopyInput';

export { CopyInput };
