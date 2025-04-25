import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { OrderStatus } from '../entities/order.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createOrder(createOrderDto: any, buyerId: number): Promise<Order> {
    const { items } = createOrderDto;
    let order = new Order();

    // Check if buyer exists
    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }

    // Get all products in one query
    const productIds = items.map(item => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['seller'],
    });

    if (products.length !== items.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
    }

    // Check stock and calculate total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [] ;
    
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.id}`);
        }
        
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          order: order,
          product: {id : product.id} as  Product,
          quantity: item.quantity,
          unitPrice: product.price,
        });
      }
    }

    // Create order with reference number
    const referenceNumber = uuidv4().replace(/-/g, '').substring(0, 20);
    order = this.orderRepository.create({
      buyerId,
      totalAmount,
      referenceNumber,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items and update product stock
    const savedItems = await Promise.all(
      orderItems.map(async item => {
        const orderItem = this.orderItemRepository.create({
          order: {id: savedOrder.id} as Order,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });

        // Update product stock
        await this.productRepository.decrement(
          item.product,
          'stock',
          item.quantity,
        );

        return this.orderItemRepository.save(orderItem);
      }),
    );

    savedOrder.items = savedItems;
    return savedOrder;
  }
  async getUserOrders(userId: number, role: 'seller' | 'buyer', query: any = {}): Promise<Order[]> {
    const { status, limit = 10, offset = 0 } = query;
    
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('seller.user', 'user')
      .skip(offset)
      .take(limit);

    if (status) {
      qb.where('order.status = :status', { status });
    }

    if (role === 'buyer') {
      qb.andWhere('order.buyerId = :userId', { userId });
    } else {
      qb.andWhere('product.seller.user_id = :userId', { userId });
    }

    return qb.getMany();
  }

  async getOrderById(id: number, userId: number, role: 'seller' | 'buyer'): Promise<Order> {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('order.id = :id', { id });

    if (role === 'buyer') {
      qb.andWhere('order.buyerId = :userId', { userId });
    } else {
      qb.andWhere('product.seller.user_id = :userId', { userId });
    }

    const order = await qb.getOne();

    if (!order) {
      throw new NotFoundException('Order not found or access denied');
    }

    return order;
  }

  async updateOrderStatus(id: number, status: string, sellerId: number): Promise<Order> {
    // Verify the order belongs to this seller
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.id = :id', { id })
      .andWhere('product.seller.user_id = :sellerId', { sellerId })
      .getOne();

    if (!order) {
      throw new NotFoundException('Order not found or you are not the seller');
    }

    // Validate status transition
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    };

    if (
      validTransitions[order.status] &&
      !validTransitions[order.status].includes(status as OrderStatus)
    ) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
  }
}