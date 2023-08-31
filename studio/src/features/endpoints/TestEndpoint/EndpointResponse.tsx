import { CodeEditor } from '@/components/CodeEditor';
import { Logs } from '@/components/Log';
import { TableCell, TableRow } from '@/components/Table';
import { Tabs, TabsList, TabsTrigger } from '@/components/Tabs';
import { ENDPOINT_RESPONSE_TABS } from '@/constants';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { cn, objToArray } from '@/utils';
import { TabsContent } from '@radix-ui/react-tabs';
import { useTranslation } from 'react-i18next';
import TestEndpointTable from './TestEndpointTable';
export default function EndpointResponse() {
	const { t } = useTranslation();
	const { endpointResponse, endpoint } = useEndpointStore();
	const response = endpointResponse[endpoint?._id as string];

	return (
		<Tabs defaultValue='body' className='border border-border rounded px-4 pb-4 h-[90%] box'>
			<div className='flex items-center justify-between'>
				<TabsList defaultValue='body' align='center' className='flex-1'>
					{ENDPOINT_RESPONSE_TABS.map((tab) => (
						<TabsTrigger key={tab.id} id={tab.id} value={tab.id} className='flex-1'>
							{tab.name}
						</TabsTrigger>
					))}
				</TabsList>
				<div className='flex items-center gap-4'>
					<div className='text-sm text-default'>
						{t('endpoint.status')}
						<span
							className={cn(
								'ml-2',
								response?.statusText === 'OK' ? 'text-green-500' : 'text-red-500',
							)}
						>
							{response?.status}
						</span>
					</div>
					{response?.duration && response?.duration > 0 && (
						<div className='text-sm text-default'>
							{t('endpoint.duration')}
							<span
								className={cn(
									'ml-2',
									response?.statusText === 'OK' ? 'text-green-500' : 'text-red-500',
								)}
							>
								{response?.duration.toFixed(2)} ms
							</span>
						</div>
					)}
				</div>
			</div>

			<TabsContent value='body' className='h-[85%]'>
				<CodeEditor
					containerClassName='h-full'
					value={JSON.stringify(response?.data, null, 2)}
					defaultLanguage='json'
					readonly
				/>
			</TabsContent>
			<TabsContent value='cookies'>
				{/* {fields.map((f, index) => (
						<TableRow key={f.id}>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
					))} */}
			</TabsContent>
			<TabsContent value='headers'>
				<TestEndpointTable>
					{objToArray(response?.headers).map((header) => (
						<TableRow key={header.value}>
							<TableCell>{header.key}</TableCell>
							<TableCell>{header.value}</TableCell>
						</TableRow>
					))}
				</TestEndpointTable>
			</TabsContent>
			<TabsContent value='console'>
				<div className='flex flex-col gap-6'>
					<Logs logs={response?.logs as string[]} />
				</div>
			</TabsContent>
		</Tabs>
	);
}
