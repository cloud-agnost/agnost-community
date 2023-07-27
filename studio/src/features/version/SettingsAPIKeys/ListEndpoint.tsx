import { APIKeyTypes, Endpoint } from '@/types';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { Schema } from '@/features/version/SettingsAPIKeys/index.ts';
import { useTranslation } from 'react-i18next';
import { Badge } from 'components/Badge';
import { ReactNode } from 'react';

interface ListEndpointProps {
	type: APIKeyTypes;
	children?: ReactNode;
	endpoints?: Endpoint[];
}

export default function ListEndpoint({ type, children, endpoints }: ListEndpointProps) {
	const form = useFormContext<z.infer<typeof Schema>>();
	const { t } = useTranslation();
	const key = type === 'custom-allowed' ? 'allowedEndpoints' : 'excludedEndpoints';
	const values = form.getValues(`general.endpoint.${key}`).filter((item) => item.url);

	function clear(index: number) {
		const newValues = values.filter((_, i) => i !== index);
		form.setValue(`general.endpoint.${key}`, newValues);
	}

	function getName(iid: string) {
		const name = endpoints?.find((item) => item.iid === iid)?.name;
		if (!name) return iid;
		return name;
	}

	return (
		<div className='space-y-3'>
			{values.length > 0 ? (
				<>
					<span className='text-subtle text-sm leading-6'>
						{key === 'allowedEndpoints'
							? t('version.api_key.allowed_endpoints')
							: t('version.api_key.excluded_endpoints')}
					</span>
					<div className='flex items-center gap-2 overflow-auto no-scrollbar'>
						{values.map((item, index) => (
							<Badge
								className='whitespace-nowrap'
								onClear={() => clear(index)}
								text={getName(item.url)}
								key={index}
							/>
						))}
					</div>
				</>
			) : (
				<span className='text-subtle text-sm leading-6'>
					{t('version.api_key.select_endpoint_desc')}
				</span>
			)}
			<div className='space-y-2'>{children}</div>
		</div>
	);
}
