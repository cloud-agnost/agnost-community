import { CustomCellRendererProps } from 'ag-grid-react';
import { Link } from 'react-router-dom';

export default function LinkField({ value }: CustomCellRendererProps<any, string>) {
	return (
		<Link
			to={value as string}
			className='link truncate block'
			target='_blank'
			rel='noopener noreferrer'
		>
			{value}
		</Link>
	);
}
