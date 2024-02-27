import { Label } from '@/components/Label';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { OPERATORS } from '@/constants';
import { useColumnFilter } from '@/hooks';
import useUtilsStore from '@/store/version/utilsStore';
import { FieldTypes, Operators } from '@/types';

const OperatorSelect = ({
	defaultValue,
	columnName,
	type,
}: {
	defaultValue: Operators;
	columnName: string;
	type: FieldTypes;
}) => {
	const { setColumnFilters } = useUtilsStore();
	const { filterType, selectedFilter } = useColumnFilter(columnName, type);
	const onOperatorChange = (operator: Operators) => {
		if (operator === Operators.None) {
			// console.log('clearColumnFilter', {
			// 	firstCondition: selectedFilter.conditions[0],
			// 	selectedFilter,
			// 	columnName: {
			// 		...selectedFilter,
			// 		filterType,
			// 		operator,
			// 	},
			// });
			setColumnFilters(columnName, {
				filterType,
				conditions: [selectedFilter.conditions[0]],
			});
		} else {
			setColumnFilters(columnName, {
				...selectedFilter,
				filterType,
				operator,
			});
		}
	};
	return (
		<RadioGroup
			onValueChange={onOperatorChange}
			defaultValue={defaultValue ?? Operators.And}
			className='flex items-center gap-6 justify-center'
		>
			{OPERATORS.map((item) => (
				<div className='flex items-center gap-2' key={item.value}>
					<RadioGroupItem value={item.value} id={item.value} />
					<Label htmlFor={item.value}>{item.label}</Label>
				</div>
			))}
		</RadioGroup>
	);
};

export default OperatorSelect;
