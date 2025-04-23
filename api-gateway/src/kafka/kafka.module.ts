import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { kafkaConfig } from '../config/kafka.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        ...kafkaConfig,
        options: {
          ...(kafkaConfig.options ?? {}),
          consumer: { ...(kafkaConfig.options?.consumer ?? {}), groupId: 'user-service' },
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        ...kafkaConfig,
        options: {
          ...(kafkaConfig.options ?? {}),
          consumer: { ...(kafkaConfig.options?.consumer ?? {}), groupId: 'product-service' },
        },
      },
      {
        name: 'ORDER_SERVICE',
        ...kafkaConfig,
        options: {
          ...(kafkaConfig.options ?? {}),
          consumer: { ...(kafkaConfig.options?.consumer ?? {}), groupId: 'order-service' },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}