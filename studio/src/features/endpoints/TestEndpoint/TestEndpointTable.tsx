import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/Table';
import { useTranslation } from 'react-i18next';
import { Resizable } from 'react-resizable';
import { useState } from 'react';
interface TestEndpointTableProps {
	children: React.ReactNode;
	isFormData?: boolean;
	width?: number;
	height?: number;
}

export default function TestEndpointTable({
	children,
	width = 700,
	height = 90,
	isFormData = false,
}: TestEndpointTableProps) {
	const [size, setSize] = useState({
		width,
		height,
	});
	const { t } = useTranslation();
	return (
		<Resizable
			height={size.height}
			width={size.width}
			onResize={(_, { size }) => {
				setSize(size);
			}}
			axis='y'
		>
			<div className='space-y-4 box'>
				<Table style={{ width: size.width + 'px', height: size.height + 'px' }}>
					<TableHeader>
						<TableRow className='head bg-wrapper-background-light'>
							{isFormData && <TableHead>{t('general.type')} </TableHead>}
							<TableHead>{t('endpoint.test.key')}</TableHead>
							<TableHead>{t('endpoint.test.value')}</TableHead>
							<TableHead>{t('general.actions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{children}</TableBody>
				</Table>
			</div>
		</Resizable>
	);
}
