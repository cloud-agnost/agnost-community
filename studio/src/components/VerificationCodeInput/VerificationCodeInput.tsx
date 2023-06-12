import VerificationInput from 'react-verification-input';
import './verificationCodeInput.scss';
import { cn } from '@/utils';

type VerificationCodeInputProps = {
	error?: boolean;
	onChange?: (value: string) => void;
	onComplete?: (value: string) => void;
};

const VerificationCodeInput = ({ error, onChange, onComplete }: VerificationCodeInputProps) => {
	return (
		<VerificationInput
			length={6}
			placeholder=''
			validChars='0-9'
			classNames={{
				container: 'code-input',
				character: cn('code-input-character', error && 'code-input-character--error'),
				characterInactive: 'code-input-character--inactive',
				characterSelected: 'code-input-character--selected',
			}}
			onChange={onChange}
			onComplete={onComplete}
		/>
	);
};

export { VerificationCodeInput };
