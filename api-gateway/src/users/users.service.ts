import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  async getUserProfile(userId: string) {
    const response = await lastValueFrom(
      this.userServiceClient.send('get_user_profile', userId),
    );
    return response;
  }
}