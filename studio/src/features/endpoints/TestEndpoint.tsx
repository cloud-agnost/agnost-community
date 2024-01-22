import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { Input } from '@/components/Input';
import { Separator } from '@/components/Separator';
import { BASE_URL, HTTP_METHOD_BADGE_MAP, TEST_ENDPOINTS_MENU_ITEMS } from '@/constants';
import { useToast } from '@/hooks';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useUtilsStore from '@/store/version/utilsStore';
import { APIError, EnvironmentStatus, TestMethods } from '@/types';
import {
	cn,
	generateId,
	getEndpointPath,
	getPathParams,
	joinChannel,
	leaveChannel,
	serializedStringToFile,
} from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useSearchParams } from 'react-router-dom';
import * as z from 'zod';
import { OrganizationMenuItem } from '../organization';
import EndpointBody from './TestEndpoint/EndpointBody';
import EndpointHeaders from './TestEndpoint/EndpointHeaders';
import EndpointParams from './TestEndpoint/EndpointParams';
import EndpointPathVariables from './TestEndpoint/EndpointPathVariables';
import EndpointResponse from './TestEndpoint/EndpointResponse';
import { CopyButton } from '@/components/CopyButton';
interface TestEndpointProps {
	open: boolean;
	onClose: () => void;
}

export const TestEndpointSchema = z.object({
	params: z.object({
		queryParams: z.array(
			z.object({
				key: z.string(),
				value: z.string(),
			}),
		),
		pathVariables: z
			.array(
				z.object({
					key: z.string(),
					value: z.string(),
				}),
			)
			.optional(),
	}),
	bodyType: z.enum(['json', 'form-data']).default('json'),
	headers: z
		.array(
			z.object({
				key: z.string(),
				value: z.string(),
			}),
		)
		.optional(),
	body: z.string().optional().default('{}'),
	formData: z
		.array(
			z.object({
				type: z.enum(['text', 'file']),
				key: z.string(),
				value: z.string().optional(),
				file: z.instanceof(File).optional(),
			}),
		)
		.optional(),
});

export default function TestEndpoint({ open, onClose }: TestEndpointProps) {
	const { t } = useTranslation();
	const { toast } = useToast();
	const { environment } = useEnvironmentStore();
	const { endpoint, testEndpoint } = useEndpointStore();
	const { endpointRequest } = useUtilsStore();
	const resizerRef = useRef<HTMLDivElement>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const [debugChannel, setDebugChannel] = useState<string | null>('');
	const form = useForm<z.infer<typeof TestEndpointSchema>>({
		resolver: zodResolver(TestEndpointSchema),
		defaultValues: {
			headers: [
				{
					key: 'Content-Type',
					value: 'application/json',
				},
				{
					key: 'Authorization',
					value: '',
				},
			],
			bodyType: 'json',
			body: '{}',
		},
	});
	const { mutateAsync: testEndpointMutate, isPending } = useMutation({
		mutationFn: testEndpoint,
		onError: ({ details }: APIError) => {
			toast({
				title: details,
				action: 'error',
			});
		},
	});
	async function onSubmit(data: z.infer<typeof TestEndpointSchema>) {
		const testPath = getEndpointPath(endpoint?.path, data.params.pathVariables ?? []);
		if (debugChannel) leaveChannel(debugChannel);
		const id = generateId();
		setDebugChannel(id);
		joinChannel(id);
		testEndpointMutate({
			epId: endpoint?._id,
			envId: environment?.iid,
			path: testPath,
			consoleLogId: id,
			method: endpoint?.method.toLowerCase() as TestMethods,
			params: data.params,
			headers: data.headers?.filter((h) => h.key && h.value),
			body: data.body ?? {},
			formData: data.formData,
			bodyType: data.bodyType,
		});
	}

	function handleClose() {
		leaveChannel(debugChannel as string);
		setDebugChannel(null);
		onClose();
	}
	useEffect(() => {
		const header = {
			key: 'Content-Type',
			value:
				form.getValues('bodyType') === 'form-data' ? 'multipart/form-data' : 'application/json',
		};

		form.setValue('headers', [header]);
	}, [form.getValues('bodyType')]);

	useEffect(() => {
		const req = endpointRequest?.[endpoint?._id];
		if (req) {
			form.reset({
				params: {
					queryParams: req.params.queryParams,
					pathVariables: req.params.pathVariables,
				},
				headers: req.headers,
				body: req.body,
				formData: req?.formData?.map((f) => ({
					...f,
					...(f.type === 'file' && { file: serializedStringToFile(f.value as string, f.key) }),
				})),
				bodyType: req.bodyType,
			});
		} else {
			form.reset({
				params: {
					queryParams: [],
					pathVariables: [],
				},
				headers: [
					{
						key: 'Content-Type',
						value: 'application/json',
					},
					{
						key: 'Authorization',
						value: '',
					},
				],
				bodyType: 'json',
				body: JSON.stringify({}),
				formData: [],
			});
		}
	}, [endpointRequest?.[endpoint?._id]]);

	useEffect(() => {
		if (!searchParams.get('t') && open) {
			searchParams.set('t', 'params');
			setSearchParams(searchParams);
		}
	}, [searchParams.get('t'), open]);

	return (
		<Drawer open={open} onOpenChange={handleClose}>
			<DrawerContent position='right' size='lg' className={cn('h-full flex [&>*]:w-full flex-col')}>
				<DrawerHeader>
					<DrawerTitle>{t('endpoint.test.title')}</DrawerTitle>
				</DrawerHeader>
				<div>
					{environment?.serverStatus === EnvironmentStatus.Deploying && (
						<div className='px-5'>
							<Alert variant='warning'>
								<AlertTitle>{t('endpoint.test.deploy.warning')}</AlertTitle>
								<AlertDescription>{t('endpoint.test.deploy.description')}</AlertDescription>
							</Alert>
						</div>
					)}

					<div className='flex items-center px-5 my-6'>
						<div className='rounded-l w-16 h-9'>
							<Badge
								className='w-full h-full rounded-l rounded-r-none'
								variant={HTTP_METHOD_BADGE_MAP[endpoint?.method as string]}
								text={endpoint?.method as string}
							/>
						</div>
						<div className='relative w-full'>
							<Input className='rounded-none rounded-r !bg-base' value={endpoint.path} disabled />
							<CopyButton
								text={`${BASE_URL}/${environment?.iid}${endpoint.path}`}
								className='absolute right-2 top-1 w-7 h-7'
							/>
						</div>
						<Button
							className='ml-3'
							size='lg'
							variant='primary'
							onClick={() => form.handleSubmit(onSubmit)()}
							loading={isPending}
							disabled={environment?.serverStatus !== 'OK'}
						>
							{t('endpoint.test.send')}
						</Button>
					</div>
					<nav className='mx-auto flex border-b'>
						{TEST_ENDPOINTS_MENU_ITEMS.filter(
							(t) => !t.isPath || !!getPathParams(endpoint?.path).length,
						)
							.filter((t) => t.allowedMethods?.includes(endpoint?.method))
							.map((item) => {
								return (
									<OrganizationMenuItem
										key={item.name}
										item={item}
										active={window.location.search.includes(item.href)}
									/>
								);
							})}
					</nav>
				</div>
				<Form {...form}>
					<PanelGroup className='p-6' direction='vertical' autoSaveId={endpoint._id}>
						<Panel defaultSize={32} className='max-h-full !overflow-y-auto' minSize={20}>
							<div
								className={cn(
									'h-full',
									searchParams.get('t') === 'body' &&
										form.watch('bodyType') === 'json' &&
										'overflow-hidden',
								)}
							>
								<form className={cn('space-y-6', searchParams.get('t') === 'body' && 'h-full')}>
									{searchParams.get('t') === 'params' && <EndpointParams />}
									{searchParams.get('t') === 'variables' &&
										!!getPathParams(endpoint?.path).length && <EndpointPathVariables />}
									{searchParams.get('t') === 'headers' && <EndpointHeaders />}
									{searchParams.get('t') === 'body' && <EndpointBody />}
								</form>
							</div>
						</Panel>
						<PanelResizeHandle className='my-6'>
							<Separator
								className='cursor-row-resize h-1 flex items-center justify-center'
								ref={resizerRef}
							/>
						</PanelResizeHandle>
						<Panel minSize={30}>
							<EndpointResponse className='h-full' editorClassName='h-full' />
						</Panel>
					</PanelGroup>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
