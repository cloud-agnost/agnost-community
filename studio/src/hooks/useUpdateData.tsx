import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError, Field } from '@/types';
import { capitalize, getNestedPropertyValue, isEmpty, updateObject } from '@/utils';
import { useToast } from '.';
export default function useUpdateData(field: Field) {
	const { updateDataFromModel, selectedSubModelId, data: modelData } = useNavigatorStore();
	const { notify } = useToast();
	const { subModel, nestedModels } = useModelStore();
	const hasSubModel = !isEmpty(subModel);

	function getModelPath(): string {
		const arr = nestedModels.reduce<(string | number)[]>((result, item) => {
			result.push(item.name, item.index);
			return result;
		}, []);

		return arr.slice(0, arr.length - 1).join('.');
	}

	function updateData(data: any, id: string, rowIndex: number) {
		let updatedData: any;

		if (hasSubModel) {
			if (subModel.type === 'sub-model-list') {
				updatedData = updateSubModelList(data, rowIndex);
			} else if (subModel.type === 'sub-model-object') {
				updatedData = updateSubModelObject(data);
			}
		} else {
			updatedData = data;
		}

		updateDataFromModel({
			id: hasSubModel ? selectedSubModelId : id,
			isSubObjectUpdate: hasSubModel,
			data: updatedData,
			onSuccess: handleSuccess,
			onError: handleError,
		});
	}

	function updateSubModelList(data: any, rowIndex: number) {
		const firstIndex = modelData.findIndex((m) => m.id === selectedSubModelId);
		const updatedData = updateObject(
			structuredClone(modelData[firstIndex]),
			`${getModelPath()}.${rowIndex}.${field.name}`,
			() => data[field.name],
		);

		return {
			[nestedModels[0].name]: updatedData[nestedModels[0].name],
		};
	}

	function updateSubModelObject(data: any) {
		return { [`${nestedModels.map((m) => m.name).join('.')}.${field.name}`]: data[field.name] };
	}

	function handleSuccess(updatedData: any) {
		useNavigatorStore.setState({
			subModelData: getNestedPropertyValue(updatedData, getModelPath(), []),
		});
	}

	function handleError(err: APIError) {
		notify({
			title: capitalize(err.error).replace(/_/g, ' '),
			description: err.details,
			type: 'error',
		});
	}

	return updateData;
}
