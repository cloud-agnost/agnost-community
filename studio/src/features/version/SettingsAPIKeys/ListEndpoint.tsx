import { APIKeyTypes } from '@/types';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { Schema } from '@/features/version/SettingsAPIKeys/index.ts';
import { useTranslation } from 'react-i18next';
import { Badge } from 'components/Badge';
import { ReactNode } from 'react';

interface ListEndpointProps {
	type: APIKeyTypes;
	children?: ReactNode;
}

export default function ListEndpoint({ type, children }: ListEndpointProps) {
	const form = useFormContext<z.infer<typeof Schema>>();
	const { t } = useTranslation();
	const key = type === 'custom-allowed' ? 'allowedEndpoints' : 'excludedEndpoints';
	const values = form.getValues(`general.endpoint.${key}`).filter((item) => item.url);

	function clear(index: number) {
		const newValues = values.filter((_, i) => i !== index);
		form.setValue(`general.endpoint.${key}`, newValues);
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
					<div className='flex items-center gap-2'>
						{values.map((item, index) => (
							<Badge clearable onClear={() => clear(index)} text={item.url} key={index} />
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
