import { Order } from '../../constants';

export class SortDto {
  readonly field: string;
  readonly order: Order;

  constructor(field: string, order: Order = Order.ASC) {
    this.field = field;
    this.order = order;
  }
}
