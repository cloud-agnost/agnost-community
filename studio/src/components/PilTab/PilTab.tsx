import { Button } from '../Button';
import './pilTab.scss';
import { useState } from 'react';
import { cn } from '@/utils';

interface PilTab {
	label: string;
	onClick: () => void;
}
interface PilTabProps {
	tabs: PilTab[];
}
export default function PilTab({ tabs }: PilTabProps) {
	const [selected, setSelected] = useState(tabs[0].label);

	return (
		<div className='tab-container'>
			{tabs.map((tab, index) => {
				return (
					<Button
						key={index}
						variant='blank'
						className={cn('tab-button', tab.label === selected ? 'active' : '')}
						onClick={() => {
							setSelected(tab.label);
							tab.onClick();
						}}
					>
						{tab.label}
					</Button>
				);
			})}
		</div>
	);
}
