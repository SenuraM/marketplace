import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const response = await lastValueFrom(
      this.userServiceClient.send('register_user', registerUserDto),
    );
    return response;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 3600, // 1 hour
    };
  }
}