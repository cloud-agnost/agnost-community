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
import { BADGE_COLOR_MAP, TEST_ENDPOINTS_MENU_ITEMS } from '@/constants';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import {
	arrayToObj,
	generateId,
	getEndpointPath,
	joinChannel,
	leaveChannel,
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
import TestEndpointParams from './TestEndpoint/TestEndpointParams';
import { TestMethods } from '@/types';
import EndpointResponse from './TestEndpoint/EndpointResponse';
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
		pathVariables: z.array(
			z.object({
				key: z.string(),
				value: z.string(),
			}),
		),
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
	const [searchParams] = useSearchParams();
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
		const pathVariables = arrayToObj(data.params.pathVariables);
		const testPath = getEndpointPath(endpoint?.path as string, pathVariables);
		const consoleLogId = generateId();
		joinChannel(consoleLogId);
		await testEndpoint({
			epId: endpoint?.iid as string,
			envId: environment?.iid as string,
			path: testPath,
			method: endpoint?.method.toLowerCase() as TestMethods,
			params: {
				queryParams: arrayToObj(data.params.queryParams),
			},
			headers: {
				...arrayToObj(data.headers?.filter((h) => h.key && h.value) as any),
				'Agnost-Session': consoleLogId,
			},
			body: data.body,
			formData: data.formData,
			onSuccess: () => {
				setLoading(false);
				leaveChannel(consoleLogId);
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
		const req = endpointRequest.find((r) => r.epId === endpoint?.iid);
		if (req) {
			form.setValue('body', req.body);
			form.setValue('headers', objToArray(req.headers));
			form.setValue('params.queryParams', objToArray(req.params.queryParams));
			form.setValue('params.pathVariables', objToArray(req.params.pathParams));
			form.setValue('formData', objToArray(req.formData));
		}
	}, [endpointRequest]);
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
							variant={BADGE_COLOR_MAP[endpoint?.method as string]}
							text={endpoint?.method as string}
						/>
					</div>
					<Input className='rounded-none rounded-r' value={endpoint.path} disabled />
					<Button
						className='ml-3'
						size='lg'
						variant='primary'
						onClick={() => {
							form.handleSubmit(onSubmit)();
						}}
						loading={loading}
					>
						{t('endpoint.test.send')}
					</Button>
				</div>
				<nav className='mx-auto flex border-b'>
					{TEST_ENDPOINTS_MENU_ITEMS.map((item) => {
						return (
							<OrganizationMenuItem
								key={item.name}
								item={item}
								active={window.location.search.includes(item.href)}
							/>
						);
					})}
				</nav>
				<div className='p-6 scroll space-y-6'>
					<Form {...form}>
						<form className='inline space-y-6'>
							{searchParams.get('t') === 'params' && <TestEndpointParams />}
							{searchParams.get('t') === 'headers' && <EndpointHeaders />}
							{searchParams.get('t') === 'body' && <EndpointBody />}
						</form>
					</Form>

					<DrawerFooter className='block h-3/4'>
						<EndpointResponse />
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
