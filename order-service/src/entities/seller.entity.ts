import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('sellers')
export class Seller {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @Column()
  country: string;

  @OneToMany(() => Product, product => product.seller)
  products: Product[];
}