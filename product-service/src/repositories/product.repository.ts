import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Product } from '../entities/product.entity';
import { IProductQuery } from '../interfaces/product.interface';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productRepository.create(product);
    return await this.productRepository.save(newProduct);
  }

  async findAll(query: IProductQuery): Promise<[Product[], number]> {
    const { page = 1, limit = 10, search, sellerId } = query;
    const skip = (page - 1) * limit;

    const options: FindManyOptions<Product> = {
      take: limit,
      skip,
      relations: ['seller', 'seller.user'],
    };

    if (search) {
      options.where = {
        name: Like(`%${search}%`),
      };
    }

    if (sellerId) {
      options.where = {
        ...options.where,
        seller: {id: sellerId },
      };
    }

    return await this.productRepository.findAndCount(options);
  }

  async findOne(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['seller', 'seller.user'],
    });
  }

  async update(id: number, updateData: Partial<Product>): Promise<Product | null> {
    await this.productRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async findOneBySeller(id: number, sellerId: number): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id, seller: {id: sellerId } },
    });
  }
}