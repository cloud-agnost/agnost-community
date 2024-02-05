import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError } from '@/types';
import { getNestedPropertyValue, isEmpty, updateObject } from '@/utils';
import { useToast } from './useToast';

export default function useUpdateData() {
	const { updateDataFromModel, selectedSubModelId, data: modelData } = useNavigatorStore();
	const { toast } = useToast();
	const { subModel, nestedModels, model } = useModelStore();
	const hasSubModel = !isEmpty(subModel);

	function getModelPath(): string {
		const arr = nestedModels.reduce<(string | number)[]>((result, item) => {
			result.push(item.name, item.index);
			return result;
		}, []);

		return arr.slice(0, arr.length - 1).join('.');
	}

	function updateData(data: any, id: string | number, rowIndex?: number, name?: string) {
		let updatedData: any;

		if (hasSubModel && name) {
			if (subModel.type === 'sub-model-list') {
				updatedData = updateSubModelList(data[name], rowIndex as number);
			} else if (subModel.type === 'sub-model-object') {
				updatedData = updateSubModelObject(data[name]);
			}
		} else {
			updatedData = data;
		}
		updateDataFromModel({
			id: hasSubModel ? selectedSubModelId : (id as string),
			isSubObjectUpdate: hasSubModel,
			data: updatedData,
			onSuccess: handleSuccess,
			onError: handleError,
		});
	}

	function updateSubModelList(data: any, rowIndex: number) {
		const firstIndex = modelData[model._id].findIndex((m) => m.id === selectedSubModelId);
		const updatedData = updateObject(
			structuredClone(modelData[firstIndex]),
			`${getModelPath()}.${rowIndex}.${name}`,
			() => data,
		);

		return {
			[nestedModels[0].name]: updatedData[nestedModels[0].name],
		};
	}

	function updateSubModelObject(data: any) {
		return { [`${nestedModels.map((m) => m.name).join('.')}.${name}`]: data };
	}

	function handleSuccess(updatedData: any) {
		useNavigatorStore.setState({
			subModelData: getNestedPropertyValue(updatedData, getModelPath(), []),
		});
	}

	function handleError({ details }: APIError) {
		toast({
			title: details,
			action: 'error',
		});
	}

	return updateData;
}
