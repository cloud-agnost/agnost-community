import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/Table';
import { useTranslation } from 'react-i18next';
interface TestEndpointTableProps {
	children: React.ReactNode;
	isFormData?: boolean;
}

export default function TestEndpointTable({
	children,
	isFormData = false,
}: TestEndpointTableProps) {
	const { t } = useTranslation();
	return (
		<div className='space-y-4 box'>
			<Table>
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
	);
}
