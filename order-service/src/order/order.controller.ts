import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('create_order')
  async createOrder(@Payload() data: { createOrderDto: any; buyerId: number }) {
    return this.orderService.createOrder(data.createOrderDto, data.buyerId);
  }

  @MessagePattern('get_user_orders')
  async getUserOrders(@Payload() data: { userId: number; role: 'seller' | 'buyer'; query: any }) {
    return this.orderService.getUserOrders(data.userId, data.role, data.query);
  }

  @MessagePattern('get_order_by_id')
  async getOrderById(@Payload() data: { id: number; userId: number; role: 'seller' | 'buyer' }) {
    return this.orderService.getOrderById(data.id, data.userId, data.role);
  }

  @MessagePattern('update_order_status')
  async updateOrderStatus(@Payload() data: { id: number; updateOrderStatusDto: any; sellerId: number}) {
    return this.orderService.updateOrderStatus(data.id, data.updateOrderStatusDto, data.sellerId);
  }
}