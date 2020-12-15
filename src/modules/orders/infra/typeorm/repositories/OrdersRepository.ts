import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';
import OrderProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  private ormRepositoryOrderProducts: Repository<OrderProducts>;

  constructor() {
    this.ormRepository = getRepository(Order);
    this.ormRepositoryOrderProducts = getRepository(OrderProducts);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = this.ormRepository.create({
      customer,
      order_products: products,
    });
    await this.ormRepository.save(order);

    const promises = products.map(product => {
      const orderProducts = this.ormRepositoryOrderProducts.create({
        order_id: order.id,
        product_id: product.id,
        price: product.price,
        quantity: product.quantity,
      });

      return this.ormRepositoryOrderProducts.save(orderProducts);
    });

    await Promise.all(promises);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const findOrder = await this.ormRepository.findOne({
      where: { id },
      relations: ['customer', 'order_products'],
    });

    return findOrder;
  }
}

export default OrdersRepository;
