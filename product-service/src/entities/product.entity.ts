import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, Length, IsPositive } from 'class-validator';
import { Seller } from './user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seller)
  @JoinColumn({ name: 'id' })
  seller: Seller;

  @Column()
  @IsNotEmpty()
  code: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ length: 100 })
  @Length(1, 100)
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsPositive()
  price: number;

  @Column('int')
  @IsPositive()
  stock: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}