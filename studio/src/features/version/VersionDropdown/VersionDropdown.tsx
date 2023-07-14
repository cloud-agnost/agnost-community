import { Button } from '@/components/Button';
import useVersionStore from '@/store/version/versionStore.ts';
import { cn } from '@/utils';
import { CaretUpDown, LockSimple, LockSimpleOpen } from '@phosphor-icons/react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuItemContainer,
	DropdownMenuTrigger,
} from 'components/Dropdown';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import './versionDropdown.scss';
import { VERSION_DROPDOWN_ITEM } from '@/constants';

export default function VersionDropdown() {
	const [open, setOpen] = useState(false);
	const { version, getVersionDashboardPath } = useVersionStore();

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<div className='version-dropdown'>
				<Link to={`${getVersionDashboardPath('/settings')}`} className='version-dropdown-label'>
					<div className='version-label-icon'>
						{version?.readOnly ? <LockSimple size={20} /> : <LockSimpleOpen size={20} />}
					</div>
					<div className='version-dropdown-label-desc'>
						<div className='version-dropdown-label-desc-name'>{version?.name}</div>
						<div className='text-xs text-subtle'>
							{version?.readOnly ? 'Read Only' : 'Read/Write'}
						</div>
					</div>
				</Link>
				<DropdownMenuTrigger asChild>
					<div className='version-dropdown-button'>
						<Button variant='blank' role='combobox' aria-expanded={open} rounded>
							<span className='version-dropdown-icon'>
								<CaretUpDown size={20} />
							</span>
						</Button>
					</div>
				</DropdownMenuTrigger>
			</div>

			<DropdownMenuContent align='end' className='version-dropdown-content'>
				<DropdownMenuItemContainer>
					{VERSION_DROPDOWN_ITEM.filter((item) => !item.disabled).map((option, index) => (
						<Fragment key={index}>
							<DropdownMenuItem
								className={cn(option.active() && 'active')}
								disabled={option.disabled}
								onClick={option.action}
							>
								{option.title()}
							</DropdownMenuItem>
							<option.after />
						</Fragment>
					))}
				</DropdownMenuItemContainer>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
