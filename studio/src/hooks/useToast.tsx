import { Toast, ToastDescription, ToastTitle } from '@/components/Toast';
import { ToastType } from '@/types';
import { toast } from 'react-toastify';

export default function useToast() {
	const notify = ({ title, description, type }: ToastType) => {
		return toast(
			<Toast type={type}>
				<ToastTitle>{title}</ToastTitle>
				<ToastDescription>{description}</ToastDescription>
			</Toast>,
		);
	};
	return { notify };
}
