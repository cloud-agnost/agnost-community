import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/Drawer';
import { Form } from '@/components/Form';
import { Input } from '@/components/Input';
import { HTTP_METHOD_BADGE_MAP, TEST_ENDPOINTS_MENU_ITEMS } from '@/constants';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { TestMethods } from '@/types';
import {
	arrayToObj,
	generateId,
	getEndpointPath,
	getPathParams,
	joinChannel,
	objToArray,
} from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import * as z from 'zod';
import { OrganizationMenuItem } from '../organization';
import EndpointBody from './TestEndpoint/EndpointBody';
import EndpointHeaders from './TestEndpoint/EndpointHeaders';
import EndpointParams from './TestEndpoint/EndpointParams';
import EndpointPathVariables from './TestEndpoint/EndpointPathVariables';
import EndpointResponse from './TestEndpoint/EndpointResponse';
import { useRef } from 'react';
import { useUpdateEffect } from '@/hooks';
import { Separator } from '@/components/Separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
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
			.optional()
			.refine(() => !getPathParams(useEndpointStore.getState().endpoint?.path).length, {
				message: 'Path variables are not allowed for this endpoint',
			}),
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
	body: z.string().optional(),
	formData: z
		.array(
			z.object({
				key: z.string(),
				value: z.string().optional(),
				file: z.instanceof(File).optional(),
			}),
		)
		.optional(),
});

export default function TestEndpoint({ open, onClose }: TestEndpointProps) {
	const { t } = useTranslation();
	const { environment } = useEnvironmentStore();
	const { endpoint, testEndpoint, endpointRequest } = useEndpointStore();
	const [loading, setLoading] = useState(false);
	const resizerRef = useRef<HTMLDivElement>(null);

	const [searchParams, setSearchParams] = useSearchParams();
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
		},
	});

	async function onSubmit(data: z.infer<typeof TestEndpointSchema>) {
		setLoading(true);
		const pathVariables = arrayToObj(data.params.pathVariables ?? []);
		const testPath = getEndpointPath(endpoint?.path as string, pathVariables);
		const consoleLogId = generateId();
		joinChannel(consoleLogId);
		await testEndpoint({
			epId: endpoint?._id as string,
			envId: environment?.iid as string,
			path: testPath,
			consoleLogId,
			method: endpoint?.method.toLowerCase() as TestMethods,
			params: {
				queryParams: arrayToObj(data.params.queryParams),
			},
			headers: {
				...arrayToObj(data.headers?.filter((h) => h.key && h.value) as any),
			},
			body: data.body,
			formData: data.formData,
			onSuccess: () => {
				setLoading(false);
			},
			onError: () => {
				setLoading(false);
			},
		});
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
		const req = endpointRequest[endpoint?._id as string];
		if (req) {
			form.setValue('body', req.body);
			form.setValue('headers', objToArray(req.headers));
			form.setValue('params.queryParams', objToArray(req.params.queryParams));
			form.setValue('params.pathVariables', objToArray(req.params.pathParams));
			form.setValue('formData', objToArray(req.formData));
		}
	}, [endpointRequest]);

	useEffect(() => {
		if (!searchParams.get('t') && open) {
			setSearchParams({ t: 'params' });
		}
	}, [searchParams.get('t'), open]);

	useEffect(() => {
		if (open && resizerRef.current) {
			const resizer = resizerRef.current as HTMLDivElement;
			const prevSibling = resizer.previousElementSibling as HTMLElement;
			const nextSibling = resizer.nextElementSibling as HTMLElement;
			// The current position of mouse
			let y = 0;
			let prevSiblingHeight = 0;

			// Handle the mousedown event
			// that's triggered when the user drags the resizer
			const mouseDownHandler = function (e: MouseEvent) {
				// Get the current mouse position

				y = e.clientY;
				const rect = prevSibling.getBoundingClientRect();
				prevSiblingHeight = rect.height;

				// Attach the listeners to document
				document.addEventListener('mousemove', mouseMoveHandler);
				document.addEventListener('mouseup', mouseUpHandler);
			};

			const mouseMoveHandler = function (e: MouseEvent) {
				const dy = e.clientY - y;

				const h =
					((prevSiblingHeight + dy) * 100) /
					(resizer.parentNode as HTMLElement).getBoundingClientRect().height;
				prevSibling.style.height = h + '%';

				const cursor = 'row-resize';
				resizer.style.cursor = cursor;
				document.body.style.cursor = cursor;

				prevSibling.style.userSelect = 'none';
				prevSibling.style.pointerEvents = 'none';

				nextSibling.style.userSelect = 'none';
				nextSibling.style.pointerEvents = 'none';
			};

			const mouseUpHandler = function () {
				resizer.style.removeProperty('cursor');
				document.body.style.removeProperty('cursor');

				prevSibling.style.removeProperty('user-select');
				prevSibling.style.removeProperty('pointer-events');

				nextSibling.style.removeProperty('user-select');
				nextSibling.style.removeProperty('pointer-events');

				// Remove the handlers of mousemove and mouseup
				document.removeEventListener('mousemove', mouseMoveHandler);
				document.removeEventListener('mouseup', mouseUpHandler);
			};

			// Attach the handler
			resizer.addEventListener('mousedown', mouseDownHandler);

			return () => {
				resizer.removeEventListener('mousedown', mouseDownHandler);
				document.removeEventListener('mousemove', mouseMoveHandler);
				document.removeEventListener('mouseup', mouseUpHandler);
			};
		}
	}, [open, resizerRef.current]);

	useUpdateEffect(() => {
		if (open && resizerRef.current) {
			const resizer = resizerRef.current as HTMLDivElement;
			const prevSibling = resizer.previousElementSibling as HTMLElement;
			const nextSibling = resizer.nextElementSibling as HTMLElement;

			if (prevSibling) {
				prevSibling.style.removeProperty('height');
			}
			if (nextSibling) {
				nextSibling.style.removeProperty('height');
			}
		}
	}, [open, searchParams.get('t'), resizerRef.current]);

	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader className='border-none'>
					<DrawerTitle>{t('endpoint.test.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='flex items-center flex-1 px-5 my-6'>
					<div className='border border-input-disabled-border rounded-l w-16 h-9'>
						<Badge
							className='w-full h-full rounded-l rounded-r-none'
							variant={HTTP_METHOD_BADGE_MAP[endpoint?.method as string]}
							text={endpoint?.method as string}
						/>
					</div>
					<Input className='rounded-none rounded-r' value={endpoint.path} disabled />
					<Button
						className='ml-3'
						size='lg'
						variant='primary'
						onClick={() => form.handleSubmit(onSubmit)()}
						loading={loading}
						disabled={loading || environment?.serverStatus !== 'OK'}
					>
						{t('endpoint.test.send')}
					</Button>
				</div>
				<nav className='mx-auto flex border-b'>
					{TEST_ENDPOINTS_MENU_ITEMS.filter(
						(t) => !t.isPath || !!getPathParams(endpoint?.path).length,
					).map((item) => {
						return (
							<OrganizationMenuItem
								key={item.name}
								item={item}
								active={window.location.search.includes(item.href)}
							/>
						);
					})}
				</nav>

				<div className='p-6 h-[85%] space-y-6'>
					{environment?.serverStatus === 'Deploying' && (
						<Alert variant='warning'>
							<AlertTitle>{t('endpoint.test.deploy.warning')}</AlertTitle>
							<AlertDescription>{t('endpoint.test.deploy.description')}</AlertDescription>
						</Alert>
					)}
					<Form {...form}>
						<form className='space-y-6'>
							{searchParams.get('t') === 'params' && <EndpointParams />}
							{searchParams.get('t') === 'variables' && !!getPathParams(endpoint?.path).length && (
								<EndpointPathVariables />
							)}
							{searchParams.get('t') === 'headers' && <EndpointHeaders />}
							{searchParams.get('t') === 'body' && <EndpointBody />}
						</form>
					</Form>
					<Separator
						className='cursor-row-resize h-1 flex items-center justify-center'
						ref={resizerRef}
					/>

					<DrawerFooter className='block h-3/4'>
						<EndpointResponse />
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
