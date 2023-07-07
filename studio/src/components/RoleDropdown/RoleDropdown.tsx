import React, { useEffect, useState } from 'react';
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
	onCheck: (roles: string[]) => void;
	onUncheck: (roles: string[]) => void;
	value?: string[];
}
function RoleDropdown({ type, onCheck, onUncheck, value }: RoleDropdownProps) {
	const { t } = useTranslation();
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const { appRoles, orgRoles } = useTypeStore();
	const roles = type === 'app' ? appRoles : orgRoles;

	useEffect(() => {
		if (value) {
			setSelectedRoles(value);
		}
	}, [value]);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline'>
					<Funnel size={16} weight='fill' className='members-filter-icon' />
					{selectedRoles.length > 0
						? t('general.selected', {
								count: selectedRoles.length,
						  })
						: t('general.filter')}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{roles.map((role) => (
					<DropdownMenuCheckboxItem
						key={role}
						checked={selectedRoles.includes(role)}
						onCheckedChange={(checked) => {
							if (checked) {
								const newSelectedRoles = [...selectedRoles, role];
								setSelectedRoles(newSelectedRoles);
								onCheck(newSelectedRoles);
							} else {
								const newSelectedRoles = selectedRoles.filter((r) => r !== role);
								setSelectedRoles(newSelectedRoles);
								onUncheck(newSelectedRoles);
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
