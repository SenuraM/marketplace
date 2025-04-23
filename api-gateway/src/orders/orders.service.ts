import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDER_SERVICE') private readonly orderServiceClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, buyerId: string) {
    const response = await lastValueFrom(
      this.orderServiceClient.send('create_order', {
        ...createOrderDto,
        buyerId,
      }),
    );
    return response;
  }

  async getUserOrders(userId: string, role: string, query: any) {
    const response = await lastValueFrom(
      this.orderServiceClient.send('get_user_orders', { userId, role, query }),
    );
    return response;
  }

  async getOrderById(id: string, userId: string, role: string) {
    const response = await lastValueFrom(
      this.orderServiceClient.send('get_order_by_id', { id, userId, role }),
    );
    return response;
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    sellerId: string,
  ) {
    const response = await lastValueFrom(
      this.orderServiceClient.send('update_order_status', {
        id,
        ...updateOrderStatusDto,
        sellerId,
      }),
    );
    return response;
  }
}