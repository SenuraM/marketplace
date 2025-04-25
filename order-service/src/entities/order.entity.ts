import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { BaseEntity } from './base.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  @Column({ name: 'buyer_id' })
  buyerId: number;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'order_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'reference_number', unique: true })
  referenceNumber: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}