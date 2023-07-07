import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/Select';
import useTypeStore from '@/store/types/typeStore';

interface RoleSelectProps {
	role: string;
	type: 'app' | 'org';
	onSelect: (role: string) => void;
}
function RoleSelect({ role, type, onSelect, ...props }: RoleSelectProps) {
	const { appRoles, orgRoles } = useTypeStore();
	const roles = type === 'app' ? appRoles : orgRoles;
	return (
		<Select defaultValue={role} onValueChange={onSelect} {...props}>
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
