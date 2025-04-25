import { Product } from '../entities/product.entity';

export interface IProductCreate {
  sellerId: number;
  createProductDto: CreateProductDto;
}

export interface IProductUpdate {
  id: number;
  sellerId: number;
  updateProductDto: UpdateProductDto;
}

export interface IProductDelete {
  id: number;
  sellerId: number;
}

export interface IProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: number;
}