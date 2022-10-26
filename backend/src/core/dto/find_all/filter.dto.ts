import { FilterCondition } from '../../constants';

export class FilterDto {
  readonly field: string;
  readonly condition: FilterCondition;
  readonly value: string;

  constructor(
    field: string,
    condition: FilterCondition = FilterCondition.EQ,
    value: string,
  ) {
    this.field = field;
    this.condition = condition;
    this.value = value;
  }
}
