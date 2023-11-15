import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/Form';
import { Logs } from '@/components/Log';
import { Separator } from '@/components/Separator';
import { useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError, Log } from '@/types';
import { generateId, joinChannel, leaveChannel } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import * as z from 'zod';

interface TestMessageQueueProps {
	open: boolean;
	onClose: () => void;
}
export const TestMessageQueueSchema = z.object({
	payload: z.string().optional().default('{}'),
});
export default function TestMessageQueue({ open, onClose }: TestMessageQueueProps) {
	const { t } = useTranslation();
	const { queue, testQueue, testQueueLogs } = useMessageQueueStore();
	const { notify } = useToast();
	const resizerRef = useRef<HTMLDivElement>(null);
	const { versionId, appId, orgId, queueId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();
	const form = useForm({
		resolver: zodResolver(TestMessageQueueSchema),
		defaultValues: {
			payload: testQueueLogs[queue?._id]?.payload,
		},
	});
	const { mutateAsync: testQueueMutation, isPending } = useMutation({
		mutationFn: testQueue,
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});

	function onSubmit(data: z.infer<typeof TestMessageQueueSchema>) {
		const debugChannel = generateId();
		joinChannel(debugChannel);
		testQueueMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queueId as string,
			debugChannel,
			...data,
		});
		setTimeout(() => {
			leaveChannel(debugChannel);
		}, 1000);
	}
	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent
				position='right'
				size='lg'
				className='gap-y-6 h-full flex [&>*]:w-full flex-col'
			>
				<DrawerHeader>
					<DrawerTitle>{t('queue.test.title')}</DrawerTitle>
				</DrawerHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 h-full'>
						<div className='flex items-center justify-between flex-1'>
							<span className='text-xl font-semibold text-default'>{queue.name}</span>
							<Button variant='primary' type='submit' loading={isPending}>
								{t('queue.test.submit')}
							</Button>
						</div>
						<Separator className='my-6' />
						<PanelGroup direction='vertical' autoSaveId={queue._id}>
							<Panel
								defaultSize={32}
								className='max-h-full no-scrollbar !overflow-y-auto'
								minSize={20}
							>
								<FormField
									control={form.control}
									name='payload'
									render={({ field }) => (
										<FormItem className='h-full'>
											<FormControl className='h-full'>
												<CodeEditor
													className='min-h-[100px] h-full'
													containerClassName='h-[calc(100%-6rem)]'
													value={field.value}
													onChange={field.onChange}
													defaultLanguage='json'
													name='testQueuePayload'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</Panel>
							<PanelResizeHandle className='my-6'>
								<Separator
									className='cursor-row-resize h-1 flex items-center justify-center'
									ref={resizerRef}
								/>
							</PanelResizeHandle>
							<Panel minSize={30}>
								<Logs logs={testQueueLogs[queue?._id]?.logs as Log[]} />
							</Panel>
						</PanelGroup>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}