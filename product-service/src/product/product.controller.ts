import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { IProductQuery } from '../interfaces/product.interface';

@Controller()
export class ProductKafkaController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern('create_product')
  async createProduct(@Payload() data: { sellerId: number; createProductDto: CreateProductDto }) {
    return await this.productService.createProduct(data.sellerId, data.createProductDto);
  }

  @MessagePattern('get_all_products')
  async getAllProducts(@Payload() query: IProductQuery) {
    return await this.productService.getAllProducts(query);
  }

  @MessagePattern('get_product_by_id')
  async getProductById(@Payload() id: number) {
    return await this.productService.getProductById(id);
  }

  @MessagePattern('update_product')
  async updateProduct(@Payload() data: { id: number; sellerId: number; updateProductDto: UpdateProductDto }) {
    return await this.productService.updateProduct(data.id, data.sellerId, data.updateProductDto);
  }

  @MessagePattern('delete_product')
  async deleteProduct(@Payload() data: { id: number; sellerId: number }) {
    return await this.productService.deleteProduct(data.id, data.sellerId);
  }
}