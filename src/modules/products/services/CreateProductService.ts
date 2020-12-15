import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const hasProduct = await this.productsRepository.findByName(name);

    if (hasProduct) {
      throw new AppError('product already exists with same name');
    }

    try {
      const product = await this.productsRepository.create({
        name,
        price,
        quantity,
      });

      return product;
    } catch (err) {
      throw new AppError(err.message);
    }
  }
}

export default CreateProductService;
