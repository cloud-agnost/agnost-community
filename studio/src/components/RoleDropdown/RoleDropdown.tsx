import React, { useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Button } from 'components/Button';
import { Funnel } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import useTypeStore from '@/store/types/typeStore';
interface RoleDropdownProps {
	type: 'app' | 'org';
	onCheck: (role: string) => void;
	onUncheck: (role: string) => void;
	defaultRole?: string;
}
function RoleDropdown({ type, onCheck, onUncheck, defaultRole }: RoleDropdownProps) {
	const { t } = useTranslation();
	const [selectedRole, setSelectedRole] = useState<string>(defaultRole || '');
	const { appRoles, orgRoles } = useTypeStore();
	const roles = type === 'app' ? appRoles : orgRoles;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline'>
					<Funnel size={16} weight='fill' className='members-filter-icon' />
					{selectedRole ? selectedRole : t('general.filter')}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{roles.map((role) => (
					<DropdownMenuCheckboxItem
						key={role}
						checked={selectedRole === role}
						onCheckedChange={(checked) => {
							if (checked) {
								setSelectedRole(role);
								onCheck(role);
							} else {
								setSelectedRole('');
								onUncheck(role);
							}
						}}
					>
						{role}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default RoleDropdown;
