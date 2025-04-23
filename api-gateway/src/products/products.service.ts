import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productServiceClient: ClientProxy,
  ) {}

  async createProduct(createProductDto: CreateProductDto, sellerId: string) {
    const response = await lastValueFrom(
      this.productServiceClient.send('create_product', {
        ...createProductDto,
        sellerId,
      }),
    );
    return response;
  }

  async getAllProducts(query: any) {
    const response = await lastValueFrom(
      this.productServiceClient.send('get_all_products', query),
    );
    return response;
  }

  async getProductById(id: string) {
    const response = await lastValueFrom(
      this.productServiceClient.send('get_product_by_id', id),
    );
    return response;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    sellerId: string,
  ) {
    const response = await lastValueFrom(
      this.productServiceClient.send('update_product', {
        id,
        ...updateProductDto,
        sellerId,
      }),
    );
    return response;
  }

  async deleteProduct(id: string, sellerId: string) {
    const response = await lastValueFrom(
      this.productServiceClient.send('delete_product', { id, sellerId }),
    );
    return response;
  }
}