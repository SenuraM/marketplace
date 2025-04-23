import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [AuthModule, KafkaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}