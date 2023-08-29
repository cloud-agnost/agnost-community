import useEnvironmentStore from '@/store/environment/environmentStore';
import { ElementType, useEffect, useState } from 'react';

export default function InstanceType({ iid, Icon }: { iid: string; Icon: ElementType }) {
	const environment = useEnvironmentStore.getState().environment;
	const [instance, setInstance] = useState('');

	useEffect(() => {
		setInstance(
			environment?.mappings.find((mapping) => mapping.design.iid === iid)?.resource
				.instance as string,
		);
	}, [environment]);

	return instance ? (
		<div className='flex items-center gap-2'>
			<Icon className='w-5 h-5' />
			<span className='whitespace-nowrap'>{instance}</span>
		</div>
	) : (
		<span className='whitespace-nowrap'>-</span>
	);
}
