import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';
import { Seller } from './entities/seller.entity';
import { OrderService } from './order/order.service';
import { OrderController } from './order/order.controller';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<string>('DB_PORT');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_NAME');

        if (!host || !port || !username || !password || !database) {
          throw new Error('Database environment variables are missing or incomplete');
        }

        return {
          type: 'postgres',
          host,
          port: parseInt(port, 10),
          username,
          password,
          database,
          entities: [User, Seller],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Order, OrderItem, User, Product, Seller]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 60, // 1 minute TTL
      }),
      inject: [ConfigService],
    }),
    KafkaModule,
  ],
  controllers: [OrderController],
  providers: [OrderService,],
})
export class AppModule {}