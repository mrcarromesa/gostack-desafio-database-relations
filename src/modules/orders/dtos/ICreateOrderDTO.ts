import Customer from '@modules/customers/infra/typeorm/entities/Customer';

interface IProduct {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
}

export default interface ICreateOrderDTO {
  customer: Customer;
  products: IProduct[];
}
