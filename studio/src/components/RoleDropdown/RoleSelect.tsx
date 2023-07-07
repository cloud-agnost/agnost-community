import useTypeStore from '@/store/types/typeStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/Select';

interface RoleSelectProps {
	role: string;
	type: 'app' | 'org';
	onSelect: (role: string) => void;
	disabled?: boolean;
}
function RoleSelect({ role, type, disabled, onSelect }: RoleSelectProps) {
	const { appRoles, orgRoles } = useTypeStore();
	const roles = type === 'app' ? appRoles : orgRoles;
	return (
		<Select defaultValue={role} onValueChange={onSelect} disabled={disabled}>
			<SelectTrigger className='w-[120px]'>
				<SelectValue>{role}</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{roles?.map((role) => (
					<SelectItem key={role} value={role}>
						{role}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export default RoleSelect;
