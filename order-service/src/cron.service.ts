import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Order)
    private readonly OrderRepository: Repository<Order>,
  ) {}

  // Run every 10 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleDailyUpdate() {
    this.logger.debug('Running order update');
    
    try {
      await this.OrderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ status: OrderStatus.DELIVERED })
        .where('status = :status', { status: OrderStatus.PENDING })
        .execute();
        
      this.logger.log('Order update completed successfully');
    } catch (error) {
      this.logger.error('Failed to update order status', error.stack);
    }
  }
}