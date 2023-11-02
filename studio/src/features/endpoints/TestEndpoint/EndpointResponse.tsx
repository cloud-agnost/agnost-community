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
import { CSSProperties } from 'react';
import { Log } from '@/types';

interface EndpointResponseProps {
	className?: string;
	style?: CSSProperties;
	editorClassName?: string;
}

export default function EndpointResponse(props: EndpointResponseProps) {
	const { t } = useTranslation();
	const { endpointResponse, endpoint } = useEndpointStore();
	const response = endpointResponse[endpoint?._id as string];

	return (
		<Tabs style={props.style} defaultValue='body' className={cn(props.className)}>
			<div className='flex items-center pb-6 justify-between'>
				<TabsList defaultValue='body' align='center' className='flex-1' containerClassName='!p-0'>
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
					{response?.duration && (
						<div className='text-sm text-default'>
							{t('endpoint.duration')}
							<span
								className={cn(
									'ml-2',
									response?.statusText === 'OK' ? 'text-green-500' : 'text-red-500',
								)}
							>
								{response?.duration}
							</span>
						</div>
					)}
				</div>
			</div>

			<TabsContent value='body' className='h-full'>
				<CodeEditor
					containerClassName='h-[calc(100%-4rem)]'
					className={cn(props.editorClassName)}
					value={JSON.stringify(response?.data, null, 2)}
					defaultLanguage='json'
					readonly
					name='endpointResponse'
				/>
			</TabsContent>
			<TabsContent value='cookies' className='overflow-y-auto h-[calc(100%-4rem)]'>
				{/* {fields.map((f, index) => (
						<TableRow key={f.id}>
							<TableCell></TableCell>
							<TableCell></TableCell>
						</TableRow>
					))} */}
			</TabsContent>
			<TabsContent value='headers' className='h-[calc(100%-4rem)]'>
				<div className='h-full overflow-y-auto no-scrollbar'>
					<TestEndpointTable containerClassName='h-auto'>
						{objToArray(response?.headers).map((header) => (
							<TableRow key={header.value}>
								<TableCell>{header.key}</TableCell>
								<TableCell>{header.value}</TableCell>
							</TableRow>
						))}
					</TestEndpointTable>
				</div>
			</TabsContent>
			<TabsContent value='console' className='h-[calc(100%-4rem)]'>
				<Logs logs={response?.logs as Log[]} />
			</TabsContent>
		</Tabs>
	);
}
