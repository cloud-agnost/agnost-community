import { CREATE_RESOURCES_ELEMENTS } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { useEffect, useState } from 'react';

export default function useCreateResource() {
	const { resourceType } = useResourceStore();
	const [createResourceElement, setCreateResourceElement] = useState(CREATE_RESOURCES_ELEMENTS[0]);

	useEffect(() => {
		if (resourceType.step === 1) {
			setCreateResourceElement(CREATE_RESOURCES_ELEMENTS[0]);
		} else {
			setCreateResourceElement(
				CREATE_RESOURCES_ELEMENTS.find(
					(resource) => resource.type === resourceType.type && resource.name === resourceType.name,
				) || CREATE_RESOURCES_ELEMENTS[0],
			);
		}
	}, [resourceType.step]);

	return createResourceElement;
}
