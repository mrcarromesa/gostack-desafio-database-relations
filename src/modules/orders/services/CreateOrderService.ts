import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository, {
  IFindProducts,
} from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  product_id: string;
  id: string;
  quantity: number;
  price: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    try {
      const customer = await this.customersRepository.findById(customer_id);

      if (!customer) {
        throw new AppError('Customer not found');
      }

      const productsIds = products.map(product => product.id);

      const productsItems = await this.productsRepository.findAllById(
        (productsIds as unknown) as IFindProducts[],
      );

      if (productsItems.length === 0) {
        throw new AppError('Product not found');
      }

      const productsUpdatedQuantity = productsItems.map(item => {
        const prod = products.findIndex(
          productItem => productItem.id === item.id,
        );
        if (prod > -1) {
          if (item.quantity - products[prod].quantity < 0) {
            throw new AppError('not has quantity');
          }
          item.quantity -= products[prod].quantity;
          products[prod].product_id = item.id;
          products[prod].price = item.price;
        }
        return item;
      });

      await this.productsRepository.updateQuantity(productsUpdatedQuantity);

      const order = await this.ordersRepository.create({
        customer,
        products,
      });

      return order;
    } catch (err) {
      throw new AppError(err.message);
    }
  }
}

export default CreateOrderService;
