import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [AuthModule, KafkaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}