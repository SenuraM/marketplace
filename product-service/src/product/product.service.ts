import { Injectable, Inject } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { Product } from '../entities/product.entity';
import { IProductQuery } from '../interfaces/product.interface';
import { Seller } from '../entities/user.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createProduct(sellerId: number, createProductDto: CreateProductDto): Promise<Product> {
    const product = {
      ...createProductDto,
      code: createProductDto.productCode,
      seller: { id: sellerId } as Seller,
    };
    return await this.productRepository.create(product);
  }

  async getAllProducts(query: IProductQuery): Promise<[Product[], number]> {
    return await this.productRepository.findAll(query);
  }

  async getProductById(id: number): Promise<Product | null> {
    const cacheKey = `product_${id}`;
    const cachedProduct = await this.cacheManager.get<Product>(cacheKey);
    
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await this.productRepository.findOne(id);
    if (product) {
      await this.cacheManager.set(cacheKey, product, 60000);
    }
    return product;
  }

  async updateProduct(id: number, sellerId: number, updateProductDto: UpdateProductDto): Promise<Product | null> {
    const existingProduct = await this.productRepository.findOneBySeller(id, sellerId);
    if (!existingProduct) {
      return null;
    }

    const updateData: Partial<Product> = {};
    if (updateProductDto.name) updateData.name = updateProductDto.name;
    if (updateProductDto.description) updateData.description = updateProductDto.description;
    if (updateProductDto.price) updateData.price = updateProductDto.price;
    if (updateProductDto.stock) updateData.stock = updateProductDto.stock;
    if (updateProductDto.productCode) updateData.code = updateProductDto.productCode;

    const updatedProduct = await this.productRepository.update(id, updateData);
    await this.cacheManager.del(`product_${id}`);
    return updatedProduct;
  }

  async deleteProduct(id: number, sellerId: number): Promise<boolean> {
    const existingProduct = await this.productRepository.findOneBySeller(id, sellerId);
    if (!existingProduct) {
      return false;
    }
    await this.productRepository.remove(id);
    return true;
  }
}